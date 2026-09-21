// app/src/utils/password.util.ts

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;

export const isValidPassword = (password: string): boolean => passwordRegex.test(password);
