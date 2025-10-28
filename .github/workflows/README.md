# Reusable CI Workflow

This repository contains a reusable GitHub Actions workflow that can be used by multiple projects for consistent CI/CD operations.

## Overview

The `ci-workflow.yml` is a reusable workflow that provides common CI jobs:
- **Setup Job**: Basic repository setup
- **Lint Job**: Code linting (optional)
- **Test Job**: Unit testing (optional)
- **Build Job**: Build verification (optional)

## Usage

### Basic Usage

To use this reusable workflow in your own workflow file:

```yaml
name: My Project CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    uses: ./.github/workflows/ci-workflow.yml
    with:
      working_directory: ./my-project
      node_version: '20.x'
      enable_lint: true
      enable_test: true
      enable_build: true
```

### Input Parameters

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `working_directory` | string | Yes | - | The working directory for CI operations |
| `node_version` | string | No | `'20.x'` | Node.js version to use |
| `enable_lint` | boolean | No | `false` | Enable linting job |
| `enable_test` | boolean | No | `false` | Enable testing job |
| `enable_build` | boolean | No | `true` | Enable build job |

## Examples

### Full CI Pipeline

```yaml
name: Full CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ci:
    uses: ./.github/workflows/ci-workflow.yml
    with:
      working_directory: ./src
      node_version: '18.x'
      enable_lint: true
      enable_test: true
      enable_build: true
```

### Build Only Pipeline

```yaml
name: Build Only

on:
  push:
    branches: [main]

jobs:
  build:
    uses: ./.github/workflows/ci-workflow.yml
    with:
      working_directory: ./app
      enable_lint: false
      enable_test: false
      enable_build: true
```

### Multiple Projects

```yaml
name: Multi-Project CI

on:
  push:
    branches: [main]

jobs:
  frontend-ci:
    uses: ./.github/workflows/ci-workflow.yml
    with:
      working_directory: ./frontend
      enable_lint: true
      enable_test: true
      enable_build: true

  backend-ci:
    uses: ./.github/workflows/ci-workflow.yml
    with:
      working_directory: ./backend
      node_version: '16.x'
      enable_lint: false
      enable_test: true
      enable_build: true
```

## Job Details

### Setup Job
- Always runs first
- Performs basic repository checkout
- Required dependency for other jobs

### Lint Job
- Runs ESLint or similar linting tools
- Only runs when `enable_lint: true`
- Uses `npm run lint`

### Test Job
- Runs unit tests
- Only runs when `enable_test: true`
- Uses `npm test a`

### Build Job
- Runs build process to verify code compiles
- Only runs when `enable_build: true` (default)
- Uses `npm run build`

## Requirements

### Project Structure
Your project must have:
- `package.json` with required scripts
- Compatible Node.js version
- Proper npm/yarn setup

### Required npm Scripts
```json
{
  "scripts": {
    "lint": "eslint .",
    "test": "jest",
    "build": "webpack --mode=production"
  }
}
```

## Migration from Individual Workflows

### Before (Individual Workflow)
```yaml
jobs:
  setup-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: "true"

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v3
        with:
          node-version: 20.x
      - run: |
          cd ./my-project
          npm ci
          npm run build
```

### After (Reusable Workflow)
```yaml
jobs:
  ci:
    uses: ./.github/workflows/ci-workflow.yml
    with:
      working_directory: ./my-project
      enable_build: true
```

## Best Practices

1. **Consistent Configuration**: Use the same Node.js version across projects
2. **Selective Jobs**: Only enable jobs that are relevant to your project
3. **Working Directory**: Always specify the correct working directory
4. **Dependencies**: Ensure all required npm scripts exist
5. **Testing**: Test the workflow in a feature branch before merging

## Troubleshooting

### Common Issues

1. **Working Directory Not Found**
   - Ensure the `working_directory` path exists
   - Check for typos in the path

2. **npm Scripts Missing**
   - Verify `package.json` has required scripts
   - Check script names match expectations

3. **Node.js Version Issues**
   - Ensure the specified Node.js version is available
   - Check GitHub Actions runner compatibility

4. **Permissions Issues**
   - Ensure proper repository permissions
   - Check if workflow has required permissions

### Debug Tips

- Use `workflow_dispatch` to manually trigger workflows
- Check the "Actions" tab for detailed logs
- Use `debug` logging level if available
- Test with minimal configuration first

## Contributing

When modifying the reusable workflow:

1. Test changes with multiple projects
2. Update this documentation
3. Ensure backward compatibility
4. Add new inputs carefully
5. Update examples as needed