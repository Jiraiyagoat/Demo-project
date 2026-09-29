const DATABASE_ID = 'student_hub';
const RESOURCES_TABLE_ID = 'resources';
const BUCKET_ID = 'academic_files';
const DEFAULT_MODEL = 'gemini-flash-latest';

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Appwrite-Response-Format': '2.3.0'
};

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function getHeader(headers, key) {
  if (!headers) return '';
  return headers[key] || headers[key.toLowerCase()] || headers[key.toUpperCase()] || '';
}

async function parseJsonResponse(response, label) {
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : {}; } catch (_) {}
  if (!response.ok) {
    const message = data?.message || data?.error?.message || text || `${label} failed with HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data ?? {};
}

function appwriteUserHeaders(projectId, jwt) {
  return {
    ...jsonHeaders,
    'X-Appwrite-Project': projectId,
    'X-Appwrite-JWT': jwt
  };
}

async function getOwnedResource({ endpoint, projectId, jwt, userId, resourceId }) {
  if (!resourceId) throw Object.assign(new Error('Missing resourceId.'), { status: 400 });
  const url = `${endpoint}/tablesdb/${encodeURIComponent(DATABASE_ID)}/tables/${encodeURIComponent(RESOURCES_TABLE_ID)}/rows/${encodeURIComponent(resourceId)}`;
  const response = await fetch(url, { headers: appwriteUserHeaders(projectId, jwt) });
  const resource = await parseJsonResponse(response, 'Resource lookup');
  if (String(resource.userId || '') !== String(userId || '')) {
    throw Object.assign(new Error('This resource does not belong to the signed-in user.'), { status: 403 });
  }
  if (!resource.storageFileId) {
    throw Object.assign(new Error('This resource is not linked to a stored PDF.'), { status: 400 });
  }
  if (resource.mimeType && resource.mimeType !== 'application/pdf') {
    throw Object.assign(new Error('Only PDF resources can be analyzed.'), { status: 400 });
  }
  return resource;
}

async function downloadOwnedPdf({ endpoint, projectId, jwt, resource }) {
  const url = `${endpoint}/storage/buckets/${encodeURIComponent(BUCKET_ID)}/files/${encodeURIComponent(resource.storageFileId)}/download`;
  const response = await fetch(url, {
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-JWT': jwt
    }
  });
  if (!response.ok) {
    let message = `PDF download failed with HTTP ${response.status}`;
    try {
      const data = await response.json();
      message = data?.message || message;
    } catch (_) {}
    throw Object.assign(new Error(message), { status: response.status });
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw Object.assign(new Error('Stored PDF is empty.'), { status: 400 });
  if (buffer.length > 20 * 1024 * 1024) throw Object.assign(new Error('PDF is larger than the 20 MB Student Hub limit.'), { status: 413 });
  return buffer;
}

const syllabusSchema = {
  type: 'object',
  properties: {
    course: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        name: { type: 'string' },
        instructor: { type: 'string' },
        room: { type: 'string' },
        schedule: { type: 'string' }
      },
      required: ['code', 'name', 'instructor', 'room', 'schedule']
    },
    assessments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          type: { type: 'string' },
          dueDate: { type: 'string' },
          dueTime: { type: 'string' },
          weight: { type: 'number' },
          effortMinutes: { type: 'integer' },
          topics: { type: 'array', items: { type: 'string' } }
        },
        required: ['title', 'type', 'dueDate', 'dueTime', 'weight', 'effortMinutes', 'topics']
      }
    },
    topics: { type: 'array', items: { type: 'string' } },
    warnings: { type: 'array', items: { type: 'string' } }
  },
  required: ['course', 'assessments', 'topics', 'warnings']
};

function normalizeExtraction(raw) {
  const course = raw?.course || {};
  const assessments = Array.isArray(raw?.assessments) ? raw.assessments : [];
  const topics = Array.isArray(raw?.topics) ? raw.topics : [];
  const warnings = Array.isArray(raw?.warnings) ? raw.warnings : [];
  return {
    course: {
      code: cleanText(course.code, 32),
      name: cleanText(course.name, 120),
      instructor: cleanText(course.instructor, 120),
      room: cleanText(course.room, 80),
      schedule: cleanText(course.schedule, 160)
    },
    assessments: assessments.slice(0, 80).map(item => ({
      title: cleanText(item?.title, 200),
      type: cleanText(item?.type || 'Assignment', 32),
      dueDate: cleanText(item?.dueDate, 10),
      dueTime: cleanText(item?.dueTime, 5),
      weight: Number.isFinite(Number(item?.weight)) ? Number(item.weight) : 0,
      effortMinutes: Number.isFinite(Number(item?.effortMinutes)) ? Math.max(0, Math.round(Number(item.effortMinutes))) : 0,
      topics: Array.isArray(item?.topics) ? item.topics.map(t => cleanText(t, 120)).filter(Boolean).slice(0, 20) : []
    })).filter(item => item.title),
    topics: topics.map(t => cleanText(t, 120)).filter(Boolean).slice(0, 60),
    warnings: warnings.map(w => cleanText(w, 300)).filter(Boolean).slice(0, 20)
  };
}

async function analyzeWithGemini(pdfBuffer, resource) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY is not configured on the Appwrite Function.'), { status: 503 });
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const prompt = `You are extracting structured academic data from a university syllabus PDF for Student Hub.

Rules:
- Use only information explicitly present in the PDF. Do not invent missing dates, times, weights, instructors, room numbers, or topics.
- For missing text fields, return an empty string.
- For a missing numeric weight or effort estimate, return 0.
- dueDate must be YYYY-MM-DD when the PDF contains a date, otherwise an empty string.
- dueTime must be 24-hour HH:mm when explicitly stated, otherwise an empty string.
- Normalize assessment type to one of: Assignment, Quiz, Exam, Project, Other.
- Include graded homework, problem sets, quizzes, exams, projects, reports, labs, presentations, and other dated assessed work.
- Do not include ordinary lecture meetings as assessments.
- Preserve assessment titles closely to the source wording.
- Topics should be concise course concepts explicitly listed or clearly named in the syllabus.
- Put ambiguity or conflicting dates in warnings rather than guessing.
- The user will review every field before import, so extraction accuracy is more important than completeness.

Source filename: ${cleanText(resource.fileName || resource.title || 'syllabus.pdf', 255)}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'application/pdf', data: pdfBuffer.toString('base64') } }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: syllabusSchema
      }
    })
  });

  const payload = await parseJsonResponse(response, 'Gemini request');
  const text = payload?.candidates?.[0]?.content?.parts?.map(part => part?.text || '').join('').trim();
  if (!text) throw Object.assign(new Error('Gemini returned no structured syllabus output.'), { status: 502 });
  let parsed;
  try {
    parsed = JSON.parse(text.replace(/^```json\s*/i, '').replace(/\s*```$/i, ''));
  } catch (_) {
    throw Object.assign(new Error('Gemini returned an invalid JSON response.'), { status: 502 });
  }
  return { extraction: normalizeExtraction(parsed), model };
}

async function createPrivateFileUrl({ endpoint, projectId, serverKey, resource }) {
  if (!serverKey) throw Object.assign(new Error('Function token scope is not available. Enable tokens.write on the function.'), { status: 503 });
  const expire = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const response = await fetch(`${endpoint}/tokens/buckets/${encodeURIComponent(BUCKET_ID)}/files/${encodeURIComponent(resource.storageFileId)}`, {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': serverKey
    },
    body: JSON.stringify({ expire })
  });
  const token = await parseJsonResponse(response, 'File token creation');
  if (!token?.secret) throw Object.assign(new Error('Appwrite did not return a file token.'), { status: 502 });
  const url = `${endpoint}/storage/buckets/${encodeURIComponent(BUCKET_ID)}/files/${encodeURIComponent(resource.storageFileId)}/view?project=${encodeURIComponent(projectId)}&token=${encodeURIComponent(token.secret)}`;
  return { url, expire };
}

export default async ({ req, res, log, error }) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });

  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
  const userId = getHeader(req.headers, 'x-appwrite-user-id');
  const jwt = getHeader(req.headers, 'x-appwrite-user-jwt');
  const serverKey = getHeader(req.headers, 'x-appwrite-key');

  if (!endpoint || !projectId) return res.status(500).json({ ok: false, error: 'Appwrite function environment is incomplete.' });
  if (!userId || !jwt) return res.status(401).json({ ok: false, error: 'Sign in before using Academic AI.' });

  const body = req.bodyJson || {};
  const action = cleanText(body.action, 40);

  try {
    if (action === 'health') {
      return res.json({ ok: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY), model: process.env.GEMINI_MODEL || DEFAULT_MODEL });
    }

    if (action === 'fileUrl') {
      const resource = await getOwnedResource({ endpoint, projectId, jwt, userId, resourceId: body.resourceId });
      const result = await createPrivateFileUrl({ endpoint, projectId, serverKey, resource });
      return res.json({ ok: true, ...result });
    }

    if (action === 'analyzeSyllabus') {
      const resource = await getOwnedResource({ endpoint, projectId, jwt, userId, resourceId: body.resourceId });
      const pdf = await downloadOwnedPdf({ endpoint, projectId, jwt, resource });
      log(`Analyzing syllabus resource ${resource.$id} (${pdf.length} bytes) for user ${userId}.`);
      const result = await analyzeWithGemini(pdf, resource);
      return res.json({ ok: true, resourceId: resource.$id, sourceFileName: resource.fileName || resource.title || 'syllabus.pdf', ...result });
    }

    return res.status(400).json({ ok: false, error: 'Unknown action.' });
  } catch (err) {
    error?.(err?.stack || String(err));
    const status = Number(err?.status) || 500;
    return res.status(status >= 400 && status < 600 ? status : 500).json({ ok: false, error: err?.message || 'Academic AI failed.' });
  }
};
