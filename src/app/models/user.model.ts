export interface User {
    _id: string;
    name: string;
    birthDate: Date | undefined;
    email: string;
    isAdmin: boolean;
    isHidden: boolean;
    password: string;
    weight: string;
    city: string;
    phone: string;
    gender: string;
    profilePicture?: string;
    boxingVideo?: string;
  }

  export interface CreateUserDTO {
    name: string;
    birthDate: Date | undefined;
    email: string;
    password: string;
    isAdmin: boolean;
    isHidden: boolean;
    weight: string; // New field
    city: string;   // New field
    phone: string;  // New field
    gender: string; // New field
  }
  
export class User implements User {
    constructor() {}
}
