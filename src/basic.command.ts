import { Command, CommandRunner, Option } from 'nest-commander';

interface BasicCommandOptions {
  name?: string;
}

@Command({ name: 'basic', description: 'A basic example command', options: { isDefault: true } })
export class BasicCommand extends CommandRunner {
  async run(passedParams: string[], options: BasicCommandOptions): Promise<void> {
    const name = options.name ?? passedParams[0] ?? 'World';
    console.log(`Hello, ${name}!`);
  }

  @Option({
    flags: '-n, --name <name>',
    description: 'Name to greet',
  })
  parseName(val: string): string {
    return val;
  }
}
