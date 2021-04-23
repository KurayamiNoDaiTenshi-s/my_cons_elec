export class ResourceNotFoundError extends Error{
    constructor(message) {
        super(message);
        this.name = "ResourceNotFoundError";
        this.message = message;
    }
}
