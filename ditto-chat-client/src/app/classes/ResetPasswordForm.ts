export default class ResetPasswordForm {
    private password: string;
    private repeatedPassword: string;

    public constructor(password: string, repeatedPassword: string) {
        this.password = password;
        this.repeatedPassword = repeatedPassword;
    }
}
