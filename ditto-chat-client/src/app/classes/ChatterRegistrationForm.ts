export default class ChatterRegistrationForm {
    private name: string;
    private surname: string;
    private username: string;
    private email: string;
    private password: string;

    public constructor(
        name: string,
        surname: string,
        username: string,
        email: string,
        password: string
    ) {
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public getName(): string {
        return this.name;
    }

    public getSurname(): string {
        return this.surname;
    }

    public getUsername(): string {
        return this.username;
    }

    public getEmail(): string {
        return this.email;
    }

    public getPassword(): string {
        return this.password;
    }
}
