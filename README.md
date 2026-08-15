# dsh-agent-doctor

A small DeepSeek Harness (DSH) health and safety diagnostics plugin.

`/doctor` inspects the effective model-visible tool surface for the receiving agent and reports bounded configuration signals without claiming to be a security scanner, sandbox, or danger classifier.

## v0.1 checks

- model-visible tool count and names;
- whether reserved `run_code` is visible;
- heuristic warning for obviously side-effect-shaped tool names;
- optional AgentFuse presence requirement;
- optional approval-service availability signal.

The name-based side-effect check is a diagnostic hint only. It does not authorize or block execution. Use a real runtime policy boundary such as AgentFuse for enforcement.

## DSH integration

This repository is intended to be mounted as a DSH bundle. DSH is currently Developer Preview; the plugin targets the pinned public architecture where human commands are registered through `ctx.commands` and effective tool schemas are exposed by `ctx.tools`.

```yaml
- id: dsh-agent-doctor
  name: '@mkaliezz/dsh-agent-doctor'
  config:
    requireAgentFuse: false
    forbidRunCode: true
```

Run `/doctor` from an interactive DSH surface after the bundle is composed.

## Development

```bash
npm test
```

The core checker has no runtime dependencies and is tested independently of the DSH monorepo. A monorepo compatibility proof should be run against each pinned DSH revision before claiming compatibility.

## Non-claims

- not an antivirus or malware scanner;
- not a process sandbox;
- not a policy enforcement boundary;
- does not prove that a tool is safe from its name;
- does not prove effective profile immutability.

## License

MIT
