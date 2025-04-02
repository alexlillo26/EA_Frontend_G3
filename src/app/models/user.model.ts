export interface User {
    _id: string;
    name: string;
    birthDate: Date | undefined;
    email: string;
    isAdmin: boolean;
    isHidden: boolean;
    password: string;
  }

  export interface CreateUserDTO {
    name: string;
    birthDate: Date | undefined;
    email: string;
    password: string;
    isAdmin: boolean;
    isHidden: boolean;
  }
  
export class User implements User {
    constructor() {}
}
  