import { Request, Response } from "express";
import authService from "../services/auth.service";
import { RegisterUserDto } from "../dto/register-user.dto";
import { VerifyEmailDto } from "../dto/verify-email.dto";


export const register = async (req: Request, res: Response): Promise<Response> => {
    try{
        const dto: RegisterUserDto = req.body;
        const result = await authService.register(dto);

        return res.status(201).json({
            message: 'Registro Exitoso. Revisa tu correo para activar tu cuenta.',
            data: result,
        });
    }catch(error: any){
        return res.status(400).json({
            error: error.message
        });
    };
};

export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
    try{
        const dto: VerifyEmailDto = req.body;
        await authService.verifyEmail(dto);

        return res.status(200).json({
            message: 'Cuenta Activada correctamente'
        });
    }catch(error: any){
        return res.status(400).json({
            error: error.message
        });
    }
};