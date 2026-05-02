# QuickStack

QuickStack deploys applications from container images or Git repositories into a managed cluster.

## Language

**App**:
A deployable workload managed by QuickStack.

**Source**:
The origin QuickStack uses to build or run an **App**.

**Git HTTPS Source**:
A Git repository accessed through an HTTPS clone URL, optionally with username and token credentials.
_Avoid_: git https, HTTPS repo

**Git SSH Source**:
A Git repository accessed through an SSH clone URL using an app-specific deploy key.
_Avoid_: SSH repo

**Deploy Key**:
A public SSH key registered with a Git provider to grant repository access to a **Git SSH Source**.
_Avoid_: SSH key when specifically referring to the provider-side access grant

**Git Branch**:
The named Git ref selected as the source revision stream for an **App**.
_Avoid_: branch name when referring to the selected source branch

**App Node Port**:
A direct node-level exposure that maps a cluster node port to one container port and protocol on an 

## Relationships

- An **App** has exactly one **Source**.
- An **App** can have zero or more **App Node Ports**.
- A **Git HTTPS Source** belongs to exactly one **App**.
- A **Git SSH Source** belongs to exactly one **App**.
- A **Git Source** has exactly one selected **Git Branch** before it can be saved.
- A **Git SSH Source** requires a **Deploy Key** before QuickStack offers **Git Branch** selection.
- An **App Node Port** belongs to exactly one **App** and exposes exactly one container port/protocol.

## Example Dialogue

> **Dev:** "When the user edits a **Git HTTPS Source**, should choosing a **Git Branch** save the **App**?"
> **Domain expert:** "No, selecting the **Git Branch** only updates the current form; the **App** is saved when the user clicks Save."

> **Dev:** "Can QuickStack list branches for a **Git SSH Source** before the provider knows its **Deploy Key**?"
> **Domain expert:** "No, the user must generate the key and register it as a **Deploy Key** with the Git provider before branch selection is shown."

> **Dev:** "If an **App** uses an **App Node Port**, should a restrictive ingress policy still block that node-level traffic?"
> **Domain expert:** "No — creating the **App Node Port** is the explicit decision to expose that one container port/protocol through the cluster node."

## Flagged Ambiguities

- "connect to a git https" means configuring a **Git HTTPS Source** for an **App**.
- "branch" means the selected **Git Branch**, not a build branch or deployment branch.
- "node portforwarding" means an **App Node Port**, not an ad hoc developer port-forward session.
