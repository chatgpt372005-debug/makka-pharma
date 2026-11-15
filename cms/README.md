# Makka Pharma CMS setup
The public site is currently static on GitHub Pages. The CMS is prepared but **not connected**.

1. Create a **new** Supabase project dedicated to Makka Pharma. Do not use an unrelated existing project.
2. Run `cms/schema.sql` in that project's SQL Editor.
3. Create an admin account in Supabase Authentication and add its UUID to `site_admins` from SQL Editor.
4. Configure the project's URL and **publishable key only** in `cms/config.js`. Never use a secret or service_role key in public files.
5. Open `/admin.html` and sign in. Products and partners can then be managed through the dashboard.
6. The public site's content is still served from the static HTML. A later publishing integration is needed before CMS changes appear on the public site. Existing images are not migrated automatically.
7. Before accepting contact forms, add server-side anti-spam protection and appropriate rate limits.

Security: Row Level Security is enabled; only explicitly assigned admin accounts can write CMS records. Do not store passwords in GitHub.
