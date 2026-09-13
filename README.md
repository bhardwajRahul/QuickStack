<div align="center">

<img src="/github-assets/qs-logo-header.svg" alt="QuickStack Logo" style="width: 230px;" />

Free, open-source, self-hosted PaaS alternative to Vercel, Netlify, Railway and Heroku.

[Quick Start](https://quickstack.dev/docs/tutorials/installation) • [Website](https://quickstack.dev) • [Docs](https://quickstack.dev/docs)


[![GitHub stars](https://img.shields.io/github/stars/biersoeckli/QuickStack?style=social)](https://github.com/biersoeckli/QuickStack/stargazers) [![GitHub license](https://img.shields.io/github/license/biersoeckli/QuickStack?color=22c55e)](https://github.com/biersoeckli/QuickStack/blob/main/LICENSE) [![GitHub release](https://img.shields.io/github/v/release/biersoeckli/QuickStack?color=22c55e)](https://github.com/biersoeckli/QuickStack/releases) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/biersoeckli/QuickStack)

</div>

Deploy and manage **applications** and **databases** on your own VPS, Bare Metal or any other infrastructure through a clean web interface. QuickStack combines the simplicity and scalability of modern cloud platforms with the control of self-hosting.

<img src="/github-assets/quickstack-github-readme-demo-video.gif" alt="QuickStack Logo" style="width: 100%; border: 1px solid #D3D3D3; border-radius: 25px;" />
<div align="center">

*Deploying a Demo app with PostgreSQL in under two minutes.*

</div>

## Installation

### Requirements

- A fresh server with at least 2 CPU Cores, 4 GB RAM, 40 GB Storage
- Ubuntu/Debian is recommended
- SSH access to the server

### Install QuickStack

Open the terminal on your server and run:

```bash
curl -sfL https://get.quickstack.dev/setup.sh | sh -
```

After installation, open QuickStack in your browser and start deploying your applications. For detailed setup instructions, visit the [docs](https://quickstack.dev/docs).

## Key Features

- **Flexible deployments:** Deploy from public or private Git repositories, use any container registry, or bring your own Dockerfile. Railpack provides zero-config builds when you do not need one.
- **One-click apps and databases:** Launch popular self-hosted apps, PostgreSQL, MySQL, MariaDB, MongoDB, and Redis in seconds.
- **Production runtime controls:** Scale replicas, set CPU and memory requests and limits, configure health checks, inject environment variables, and mount config files.
- **Multi-server support:** Expand to multiple nodes, and keep persistent data on replicated Longhorn volumes.
- **Secure networking:** Isolate apps with deny-by-default network policies, connect unlimited custom domains with automatic Let's Encrypt certificates.
- **Monitoring:** View live logs, track CPU, RAM and storage usage, and configure health checks.
- **Backups you control:** Schedule volume backups to any S3-compatible target and create native database dumps.
- **Team-ready access:** Manage project and per-app permissions with user groups and roles, connect an OIDC provider for SSO, enable 2FA, and issue expiring personal API keys.
- **Automation and rollbacks:** Trigger deployments through webhooks or the REST API, and roll back an app to a previous version with one click.
- **Fully self-hosted and open source:** Install on your own infrastructure with one command, update from the UI, and avoid lock-in with GPL-3.0 source code.

<img src="/github-assets/qs-app-overview.png" alt="QuickStack app overview" width="100%" />

## How QuickStack Compares

QuickStack is a self-hosted, Kubernetes-native alternative to platforms like [Coolify](https://coolify.io), [Dokku](https://dokku.com), [Dokploy](https://dokploy.com), [Portainer](https://www.portainer.io) and [CapRover](https://caprover.com). Under the hood, QuickStack installs and manages [K3s](https://docs.k3s.io/), a lightweight Kubernetes distribution, together with [Longhorn](https://longhorn.io/docs/latest/what-is-longhorn/) for distributed persistent storage across nodes. This gives you proven Kubernetes primitives such as scheduling, services, ingress, persistent volumes, jobs, probes and multi-node orchestration through a simple web interface for day-to-day deployments.


## Contributing

Contributions are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## About

QuickStack was originally developed as a student project by [glueh-wyy-huet](https://github.com/glueh-wyy-huet) and [biersoeckli](https://github.com/biersoeckli) at the [Eastern Switzerland University of Applied Sciences](https://ost.ch/). Since then, new features have been added to make QuickStack a powerful and user-friendly platform for self-hosting.

## Related Repositories

- [biersoeckli/QuickStack-Docs](https://github.com/biersoeckli/QuickStack-Docs): The official documentation for QuickStack, including tutorials, guides and API references.
- [biersoeckli/QuickStack-sdk](https://github.com/biersoeckli/QuickStack-sdk): The official JS/TS SDK for the QuickStack API, allowing developers to interact with QuickStack programmatically.
- [biersoeckli/QuickStack-auth-proxy](https://github.com/biersoeckli/QuickStack-auth-proxy): A reverse proxy for QuickStack that handles authentication and authorization for certain services.

## License

QuickStack is licensed under the GPL-3.0 license.
