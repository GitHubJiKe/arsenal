const { input, select, confirm } = require('@inquirer/prompts');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const packagesDir = path.join(__dirname, '../packages');
const templatePath = path.join(packagesDir, 'template');

async function createProject() {
    try {
        // 1. 获取项目名称
        const projectName = await input({
            message: 'Enter the name of the new project (e.g., my-new-project):',
            validate: (value) => {
                if (!value.trim()) {
                    return 'Project name cannot be empty.';
                }
                if (fs.existsSync(path.join(packagesDir, value))) {
                    return 'A project with that name already exists.';
                }
                // 允许使用小写字母、数字和短横线，且必须以小写字母开头
                if (!/^[a-z][a-z0-9-]*$/.test(value)) {
                    return 'Project name must start with a lowercase letter and can only contain lowercase letters, numbers, and hyphens.';
                }
                return true;
            }
        });

        // 2. 确认是否基于 template 创建
        const useTemplate = await confirm({
            message: 'Create from template project?',
            default: true,
        });

        const projectPath = path.join(packagesDir, projectName);

        if (useTemplate) {
            // 3. (如果选择使用模板) 复制 template 项目
            await fs.copy(templatePath, projectPath);

            // 读取 package.json
            const packageJsonPath = path.join(projectPath, 'package.json');
            const packageJson = await fs.readJson(packageJsonPath);

            // 修改 package.json 中的 name 和 description 字段
            packageJson.name = `@arsenal/${projectName}`;
            packageJson.description = `Project ${projectName}`;

            // 写回 package.json
            await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

            console.log(`Project ${projectName} created successfully from template!`);
        } else {
            // 4. (如果不使用模板) 创建一个空目录
            await fs.mkdir(projectPath);

            // 创建 package.json
            const packageJson = {
                name: `@arsenal/${projectName}`,
                version: '0.0.0',
                description: `Project ${projectName}`,
                main: 'index.js',
                scripts: {
                    dev: "echo \"Error: no dev script specified\" && exit 1",
                    test: "echo \"Error: no test specified\" && exit 1"
                },
                keywords: [],
                author: "",
                license: "ISC",
            };

            // 写入 package.json
            await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

            console.log(`Project ${projectName} created successfully (empty project)!`);
        }

        // 5. 提示后续操作
        console.log('\nNext steps:');
        console.log(`  cd packages/${projectName}`);
        console.log(`  pnpm install`);
        console.log(`  pnpm run dev (if applicable)`);

    } catch (err) {
        console.error('Error creating project:', err);
    }
}

createProject();