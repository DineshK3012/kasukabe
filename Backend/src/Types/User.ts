export interface User{
    _id: string;
    username: number;
    name: string;
    email: string;
    profile_img: string;
    college_id: string;
    password: string;
    verified: boolean;
    matchPassword: (password: string) => Promise<boolean>;
    generateToken: () => Promise<string>;
}
