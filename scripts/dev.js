const { select } = require('@inquirer/prompts');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const packagesDir = path.join(__dirname, '../packages');

async function runDevScript() {
    try {
        // 读取 packages 目录下的所有子目录
        const projects = fs
            .readdirSync(packagesDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        // 使用 @inquirer/prompts 创建一个选择列表
        const selectedProject = await select({
            message: 'Which project do you want to run in dev mode?',
            choices: projects.map((project) => ({
                name: project,
                value: project,
            })),
        });

        // 构建子项目的绝对路径
        const projectPath = path.join(packagesDir, selectedProject);

        // 使用 exec 执行命令，先 cd 进入子项目目录，再执行 pnpm run dev
        console.log(`Running dev script for ${selectedProject}...`);
        const command = `cd ${projectPath} && pnpm run dev`; // 修改这一行

        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error}`);
                return;
            }
        });

        // 将子进程的输出流连接到父进程
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

runDevScript();