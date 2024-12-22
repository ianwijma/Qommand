import YargsParser, {Arguments} from 'yargs-parser'

export const startupArguments: Arguments = YargsParser(process.argv.slice(1))
