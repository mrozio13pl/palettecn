export class MissingComponentsJsonError extends Error {
    constructor() {
        super();
        this.name = 'MissingComponentsJson';
        this.message = `components.json file is missing in the current working directory. Aren't you in a wrong directory?

Either specify path to the css file like "palletecn styles/global.css" or use "web" command.`;
    }
}
