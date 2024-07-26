import React, { useState, useEffect } from 'react';
import { IoEye, IoEyeOff } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";
import { FaArrowRightLong } from "react-icons/fa6";
import axios from 'axios';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import config from '../../../API'; // Import the configuration file

// ZOD Schema with updated regex validations
const schema = zod.object({
    profileID: zod.string().min(1, 'Profile ID is required'),
    password: zod.string().min(1,'password is requird')
}).required();

interface LoginPopUpProps {
    onNext: () => void;
    onPhoneLogin: () => void; // Add this prop to handle phone login
    onClose: () => void;
    onForgetPassword: () => void; // Add this prop to handle forget password
    registerPopup: () => void;
}

interface FormInputs {
    profileID: string;
    password: string;
}

export const LoginPopup: React.FC<LoginPopUpProps> = ({ onNext, onPhoneLogin, onForgetPassword, onClose, registerPopup }) => {
    // Toggle the Password field
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    // React Hook form
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormInputs>({
        resolver: zodResolver(schema),
    });

    // Load profileID and password from local storage if remember me was checked
    useEffect(() => {
        const savedProfileID = localStorage.getItem('rememberMeProfileID');
        const savedPassword = localStorage.getItem('password');
        if (savedProfileID) {
            setValue('profileID', savedProfileID);
            setRememberMe(true);
        }
        if (savedPassword) {
            setValue('password', savedPassword);
        }
    }, [setValue]);

    // Handle form submission
    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        try {
            const response = await axios.post(`${config.apiUrl}/auth/login/`, {
                username: data.profileID,
                password: data.password
            });

            console.log('Login Response:', response.data);
            sessionStorage.setItem('token', response.data.token);
            if (response.data.status === 1) {
                setErrorMessage(null); // Clear error message on success
                if (rememberMe) {
                    localStorage.setItem('rememberMeProfileID', data.profileID);
                    localStorage.setItem('password', data.password); // Store password in localStorage
                } else {
                    localStorage.removeItem('rememberMeProfileID');
                    localStorage.removeItem('password'); // Remove password from localStorage
                }
                onNext(); // Proceed to the next step upon successful login
            } else {
                setErrorMessage('Please Enter the Correct Username and Password.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setErrorMessage('An error occurred while logging in. Please try again later.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <p className="text-[16px] text-primary">Welcome Back</p>
                <h5 className="text-[24px] text-primary font-semibold mb-5">Login to your account</h5>
            </div>

            <div className="mb-5">
                <input
                    type="text"
                    id="profileID"
                    className="w-full px-3 py-2 text-ash border-[1px] border-footer-text-gray rounded-[4px] focus-visible:outline-none"
                    placeholder="Profile ID"
                    {...register("profileID", { required: true })}
                />
                {errors.profileID && <span className="text-red-500">{errors.profileID.message}</span>}
            </div>

            <div className="mb-5">
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="w-full px-3 py-2 text-ash border-[1px] border-footer-text-gray rounded-[4px] focus-visible:outline-none"
                        placeholder="Create Password"
                        {...register("password", { required: true })}
                    />
                    <div onClick={handleShowPassword} className="absolute inset-y-1.5 right-0 pr-3 flex items-center text-ash text-[18px] cursor-pointer">
                        {showPassword ? <IoEyeOff /> : <IoEye />}
                    </div>
                </div>
                {errors.password && <span className="text-red-500">{errors.password.message}</span>}
            </div>

            <div className="flex justify-between items-center mb-5">
                <div>
                    <input 
                        type="checkbox" 
                        name="rememberMe" 
                        id="rememberMe" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)} 
                    />
                    <label htmlFor="rememberMe" className="text-ash ml-2">Remember Me</label>
                </div>

                <div>
                    <p onClick={onForgetPassword} className="text-secondary hover:underline cursor-pointer">Forget Password?</p>
                </div>
            </div>

            <button type="submit" className="w-full bg-gradient flex justify-center items-center py-[10px] px-[24px] rounded-[6px] space-x-2 cursor-pointer">
                <div className="text-[16px] text-white font-semibold">Login</div>
                <FaArrowRightLong className="text-white text-[22px]" />
            </button>

            {errorMessage && (
                <div className="text-red-500 mt-2">
                    {errorMessage}
                </div>
            )}

            <p className="text-ash font-semibold text-center my-5">or</p>

            <button
                onClick={onPhoneLogin}
                className="w-full py-[10px] px-[24px] bg-white text-main font-semibold border-2 rounded-[6px] mt-2"
            >
                Login with Phone Number
            </button>

            <p className="text-center text-[16px] text-ash mt-5">
                Don't have an account?{' '}
                <button
                    type="button"
                    onClick={registerPopup}
                    className="text-secondary hover:underline"
                >
                    Register Now
                </button>
            </p>

            <IoIosCloseCircle onClick={onClose} className="absolute top-[-15px] right-[-15px] text-[30px] text-black bg-white rounded-full flex items-center cursor-pointer hover:text-white hover:bg-black" />
        </form>
    );
};
