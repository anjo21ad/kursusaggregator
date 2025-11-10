# 🔑 Find Supabase Credential ID i n8n

## Quick Steps:

1. **Åbn n8n Credentials**
   - Gå til: https://n8n-production-30ce.up.railway.app/home/credentials

2. **Find "Supabase Auth - CourseHub"**
   - Klik på den credential du oprettede

3. **Kopier ID fra URL**
   - URL format: `https://n8n-production-30ce.up.railway.app/home/credentials/{ID}`
   - Eksempel: Hvis URL er `/credentials/abc123`, så er ID = `abc123`

4. **Kør update scriptet**
   ```bash
   cd frontend
   npm run n8n:update-credentials -- abc123
   ```

## Alternativ: Find ID via Browser Console

1. Åbn n8n Credentials side
2. Højreklik på "Supabase Auth - CourseHub" → "Inspect"
3. I console, kør:
   ```javascript
   // Find credential ID from data attribute eller href
   document.querySelector('[data-credential-id]')?.getAttribute('data-credential-id')
   ```

## Efter update:

Verificer at det virkede:
```bash
npm run n8n:diagnose
```

Forventet output:
```
✅ Supabase Cred: ✅ Configured
```
