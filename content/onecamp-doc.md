# OneCamp Doc

- page: onecamp-doc
- route: /onemana-doc
- content_type: Page Builder

## main_section


<style>
/* Scoped Documentation CSS to prevent global leakage */
.docs-layout-wrapper {
    background: #ffffff;
}

/* The actual layout */
.docs-container {
    display: flex;
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 24px;
    gap: 48px;
    align-items: flex-start;
}
.docs-sidebar {
    width: 280px;
    flex-shrink: 0;
    position: sticky;
    top: 100px;
    background: #f8fafc;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}
.docs-sidebar h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-top: 24px;
    margin-bottom: 12px;
    font-weight: 700;
}
.docs-sidebar h3:first-child {
    margin-top: 0;
}
.docs-sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
.docs-sidebar li a {
    display: block;
    padding: 8px 12px;
    color: #475569;
    text-decoration: none;
    border-radius: 6px;
    margin-bottom: 4px;
    font-weight: 500;
    transition: all 0.2s;
}
.docs-sidebar li a:hover, .docs-sidebar li a.active {
    background: #e2e8f0;
    color: #0f172a;
}
.docs-content {
    flex-grow: 1;
    min-width: 0;
    padding-bottom: 100px;
}
.docs-content h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
    margin-top: 0;
}
.docs-content h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e293b;
    margin-top: 48px;
    margin-bottom: 16px;
}
.docs-content h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-top: 32px;
    margin-bottom: 12px;
}
.docs-content p, .docs-content li {
    font-size: 1.1rem;
    line-height: 1.7;
    color: #475569;
    margin-bottom: 24px;
}
.docs-content ul {
    margin-bottom: 24px;
    padding-left: 24px;
}
.docs-content li {
    margin-bottom: 8px;
}
.code-block-modern {
    background: #0f172a;
    border-radius: 12px;
    overflow: hidden;
    margin: 32px 0;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}
.code-block-modern .code-header {
    background: #1e293b;
    color: #94a3b8;
    padding: 12px 16px;
    font-size: 0.85rem;
    font-family: inherit;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}
.code-block-modern pre {
    margin: 0;
    padding: 24px;
    overflow-x: auto;
}
.code-block-modern code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.95rem;
    color: #e2e8f0;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 32px 0;
}
table th, table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
}
table th {
    background: #f8fafc;
    font-weight: 600;
    color: #1e293b;
}

@media (max-width: 768px) {
    .docs-container {
        flex-direction: column;
    }
    .docs-sidebar {
        width: 100%;
        position: static;
    }
}
</style>

<div class="docs-layout-wrapper">
    <div class="docs-container">
        <aside class="docs-sidebar">
            <h3>Deployment</h3>
            <ul>
                <li><a href="#dns-subdomains" class="active">DNS Subdomains</a></li>
                <li><a href="#quick-copy">Subdomain Quick Copy</a></li>
                <li><a href="#service-reference">Service Reference</a></li>
            </ul>
            <h3>Setup Flow</h3>
            <ul>
                <li><a href="#install-commands">Installation</a></li>
                <li><a href="#oauth-callback">OAuth Callbacks</a></li>
            </ul>
        </aside>
        
        <main class="docs-content">
            <h1 id="dns-subdomains">Required DNS Subdomains for OneCamp</h1>
            
            <p class="intro">
              Please add the following subdomains to your DNS records. They should usually be <strong>A </strong> records pointing to your server IP, depending on your infrastructure.
            </p>
            
            <ul class="subdomains">
              <li>traefik.yourdomain.com</li>
              <li>onecamp-dgraph-alpha.yourdomain.com</li>
              <li>onecamp-dgraph.yourdomain.com</li>
              <li>onecamp-ch.yourdomain.com</li>
              <li>onecamp-emqx.yourdomain.com</li>
              <li>onecamp-emqx-console.yourdomain.com</li>
              <li>onecamp-collab.yourdomain.com</li>
              <li>onecamp-postgres.yourdomain.com</li>
              <li>onecamp-minio.yourdomain.com</li>
              <li>onecamp-minio-console.yourdomain.com</li>
              <li>onecamp-redis.yourdomain.com</li>
              <li>onecamp-os.yourdomain.com</li>
              <li>onecamp-backend.yourdomain.com</li>
              <li>onecamp-livekit.yourdomain.com</li>
            </ul>
            
            <h2 id="quick-copy">Quick copy-paste (without domain suffix)</h2>
            <div class="code-block-modern">
                <pre><code>traefik
onecamp-dgraph-alpha
onecamp-dgraph
onecamp-ch
onecamp-emqx
onecamp-emqx-console
onecamp-collab
onecamp-postgres
onecamp-minio
onecamp-minio-console
onecamp-redis
onecamp-os
onecamp-backend
onecamp-livekit</code></pre>
            </div>
            
            <h2 id="service-reference">Service Reference (optional – for your team)</h2>
            <table>
              <thead>
                <tr>
                  <th>Subdomain</th>
                  <th>Purpose / Service</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>traefik</td><td>Traefik dashboard &amp; API (protected)</td></tr>
                <tr><td>onecamp-dgraph-alpha</td><td>Dgraph Alpha (internal)</td></tr>
                <tr><td>onecamp-dgraph</td><td>Dgraph main endpoint</td></tr>
                <tr><td>onecamp-ch</td><td>ClickHouse</td></tr>
                <tr><td>onecamp-emqx</td><td>EMQX MQTT broker</td></tr>
                <tr><td>onecamp-emqx-console</td><td>EMQX Dashboard</td></tr>
                <tr><td>onecamp-collab</td><td>Collaboration service</td></tr>
                <tr><td>onecamp-postgres</td><td>PostgreSQL</td></tr>
                <tr><td>onecamp-minio</td><td>MinIO object storage</td></tr>
                <tr><td>onecamp-minio-console</td><td>MinIO Console</td></tr>
                <tr><td>onecamp-redis</td><td>Redis</td></tr>
                <tr><td>onecamp-os</td><td>OpenSearch / Elasticsearch</td></tr>
                <tr><td>onecamp-backend</td><td>Main application backend API</td></tr>
                <tr><td>onecamp-livekit</td><td>LiveKit (WebRTC video &amp; audio)</td></tr>
              </tbody>
            </table>
            
            <h2 id="install-commands">Run these commands in sequence</h2>
            <div class="code-block-modern">
                <div class="code-header">Terminal Setup Commands</div>
                <pre><code>cp ./.sample.env ./.env
cp ./sample-compose.yml ./compose.yml
make update-admin-email EMAIL=your-email
make update-server-ip
make replace-domain DOMAIN=your-domain
make create-traefik-password PASSWORD=secret
make update-traefik-email EMAIL=your-email
make update-allowed-domains DOMAINS=your-domain
make create-swap
make build_restart_all
make create_postgres_db
echo "127.0.0.1 onecamp-postgres.your-domain.com" | sudo tee -a /etc/hosts
ln -s /root/.cargo/bin/sqlx /usr/local/bin/sqlx
make migrate_up</code></pre>
            </div>
            
            <h2 id="oauth-callback">OAuth callback URLs (replace yourDomain.com)</h2>
            
            <h3>Authorised JS origin:</h3>
            <ul>
                <li>https://onecamp-backend.yourDomain.com</li>
                <li>https://onecamp.yourDomain.com</li>
            </ul>
            
            <h3>Authorized redirect URIs</h3>
            <ul>
                <li>https://onecamp-backend.yourDomain.com/oauth_callback/google</li>
                <li>https://onecamp-backend.yourDomain.com</li>
            </ul>
            
            <br><br><br><br><br><br>
        </main>
    </div>
</div>



## Block 1: Markdown

**content:**


<style>
/* Scoped Documentation CSS to prevent global leakage */
.docs-layout-wrapper {
    background: #ffffff;
}

/* The actual layout */
.docs-container {
    display: flex;
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 24px;
    gap: 48px;
    align-items: flex-start;
}
.docs-sidebar {
    width: 280px;
    flex-shrink: 0;
    position: sticky;
    top: 100px;
    background: #f8fafc;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}
.docs-sidebar h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-top: 24px;
    margin-bottom: 12px;
    font-weight: 700;
}
.docs-sidebar h3:first-child {
    margin-top: 0;
}
.docs-sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
.docs-sidebar li a {
    display: block;
    padding: 8px 12px;
    color: #475569;
    text-decoration: none;
    border-radius: 6px;
    margin-bottom: 4px;
    font-weight: 500;
    transition: all 0.2s;
}
.docs-sidebar li a:hover, .docs-sidebar li a.active {
    background: #e2e8f0;
    color: #0f172a;
}
.docs-content {
    flex-grow: 1;
    min-width: 0;
    padding-bottom: 100px;
}
.docs-content h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
    margin-top: 0;
}
.docs-content h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e293b;
    margin-top: 48px;
    margin-bottom: 16px;
}
.docs-content h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-top: 32px;
    margin-bottom: 12px;
}
.docs-content p, .docs-content li {
    font-size: 1.1rem;
    line-height: 1.7;
    color: #475569;
    margin-bottom: 24px;
}
.docs-content ul {
    margin-bottom: 24px;
    padding-left: 24px;
}
.docs-content li {
    margin-bottom: 8px;
}
.code-block-modern {
    background: #0f172a;
    border-radius: 12px;
    overflow: hidden;
    margin: 32px 0;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}
.code-block-modern .code-header {
    background: #1e293b;
    color: #94a3b8;
    padding: 12px 16px;
    font-size: 0.85rem;
    font-family: inherit;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}
.code-block-modern pre {
    margin: 0;
    padding: 24px;
    overflow-x: auto;
}
.code-block-modern code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.95rem;
    color: #e2e8f0;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 32px 0;
}
table th, table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
}
table th {
    background: #f8fafc;
    font-weight: 600;
    color: #1e293b;
}

.video-container {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
    height: 0;
    overflow: hidden;
    max-width: 100%;
    background: #000;
    border-radius: 16px;
    margin: 40px 0;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #e2e8f0;
}
.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
}

@media (max-width: 768px) {
    .docs-container {
        flex-direction: column;
    }
    .docs-sidebar {
        width: 100%;
        position: static;
    }
}
</style>

<div class="docs-layout-wrapper">
    <div class="docs-container">
        <aside class="docs-sidebar">
            <h3>Deployment</h3>
            <ul>
                <li><a href="#video-guide" class="active">Video Guide</a></li>
                <li><a href="#dns-subdomains">DNS Subdomains</a></li>
                <li><a href="#quick-copy">Subdomain Quick Copy</a></li>
                <li><a href="#service-reference">Service Reference</a></li>
            </ul>
            <h3>Setup Flow</h3>
            <ul>
                <li><a href="#install-commands">Installation</a></li>
                <li><a href="#oauth-callback">OAuth Callbacks</a></li>
            </ul>
        </aside>
        
        <main class="docs-content">
            <h1 id="video-guide">Setup & Installation Guide</h1>
            
            <p class="intro">
              Watch the complete video walkthrough for setting up OneCamp, configuring DNS, and launching your team's unified workspace.
            </p>
            
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/UPq-dfRHgJE" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/9HAHlKSFJJ8" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>

            <hr style="margin: 48px 0; border: none; border-top: 1px solid #e2e8f0;">

            <h2 id="dns-subdomains">Required DNS Subdomains for OneCamp</h2>
            
            <p>
              Please add the following subdomains to your DNS records. They should usually be <strong>A </strong> records pointing to your server IP, depending on your infrastructure.
            </p>
            
            <ul class="subdomains">
              <li>traefik.yourdomain.com</li>
              <li>onecamp-dgraph-alpha.yourdomain.com</li>
              <li>onecamp-dgraph.yourdomain.com</li>
              <li>onecamp-ch.yourdomain.com</li>
              <li>onecamp-emqx.yourdomain.com</li>
              <li>onecamp-emqx-console.yourdomain.com</li>
              <li>onecamp-collab.yourdomain.com</li>
              <li>onecamp-postgres.yourdomain.com</li>
              <li>onecamp-minio.yourdomain.com</li>
              <li>onecamp-minio-console.yourdomain.com</li>
              <li>onecamp-redis.yourdomain.com</li>
              <li>onecamp-os.yourdomain.com</li>
              <li>onecamp-backend.yourdomain.com</li>
              <li>onecamp-livekit.yourdomain.com</li>
            </ul>
            
            <h2 id="quick-copy">Quick copy-paste (without domain suffix)</h2>
            <div class="code-block-modern">
                <pre><code>traefik
onecamp-dgraph-alpha
onecamp-dgraph
onecamp-ch
onecamp-emqx
onecamp-emqx-console
onecamp-collab
onecamp-postgres
onecamp-minio
onecamp-minio-console
onecamp-redis
onecamp-os
onecamp-backend
onecamp-livekit</code></pre>
            </div>
            
            <h2 id="service-reference">Service Reference (optional – for your team)</h2>
            <table>
              <thead>
                <tr>
                  <th>Subdomain</th>
                  <th>Purpose / Service</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>traefik</td><td>Traefik dashboard &amp; API (protected)</td></tr>
                <tr><td>onecamp-dgraph-alpha</td><td>Dgraph Alpha (internal)</td></tr>
                <tr><td>onecamp-dgraph</td><td>Dgraph main endpoint</td></tr>
                <tr><td>onecamp-ch</td><td>ClickHouse</td></tr>
                <tr><td>onecamp-emqx</td><td>EMQX MQTT broker</td></tr>
                <tr><td>onecamp-emqx-console</td><td>EMQX Dashboard</td></tr>
                <tr><td>onecamp-collab</td><td>Collaboration service</td></tr>
                <tr><td>onecamp-postgres</td><td>PostgreSQL</td></tr>
                <tr><td>onecamp-minio</td><td>MinIO object storage</td></tr>
                <tr><td>onecamp-minio-console</td><td>MinIO Console</td></tr>
                <tr><td>onecamp-redis</td><td>Redis</td></tr>
                <tr><td>onecamp-os</td><td>OpenSearch / Elasticsearch</td></tr>
                <tr><td>onecamp-backend</td><td>Main application backend API</td></tr>
                <tr><td>onecamp-livekit</td><td>LiveKit (WebRTC video &amp; audio)</td></tr>
              </tbody>
            </table>
            
            <h2 id="install-commands">Run these commands in sequence</h2>
            <div class="code-block-modern">
                <div class="code-header">Terminal Setup Commands</div>
                <pre><code>cp ./.sample.env ./.env
cp ./sample-compose.yml ./compose.yml
make update-admin-email EMAIL=your-email
make update-server-ip
make replace-domain DOMAIN=your-domain
make create-traefik-password PASSWORD=secret
make update-traefik-email EMAIL=your-email
make update-allowed-domains DOMAINS=your-domain
make create-swap
make build_restart_all
make create_postgres_db
echo "127.0.0.1 onecamp-postgres.your-domain.com" | sudo tee -a /etc/hosts
ln -s /root/.cargo/bin/sqlx /usr/local/bin/sqlx
make migrate_up</code></pre>
            </div>
            
            <h2 id="oauth-callback">OAuth callback URLs (replace yourDomain.com)</h2>
            
            <h3>Authorised JS origin:</h3>
            <ul>
                <li>https://onecamp-backend.yourDomain.com</li>
                <li>https://onecamp.yourDomain.com</li>
            </ul>
            
            <h3>Authorized redirect URIs</h3>
            <ul>
                <li>https://onecamp-backend.yourDomain.com/oauth_callback/google</li>
                <li>https://onecamp-backend.yourDomain.com</li>
            </ul>
            
            <br><br><br><br><br><br>
        </main>
    </div>
</div>


**align:**

Left

