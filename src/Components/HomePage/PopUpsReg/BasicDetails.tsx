import React, { useState, useEffect } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../API"; // Import the configuration file

// API URL
const MARITAL_STATUS_API_URL = `${config.apiUrl}/auth/Get_Marital_Status/`;
const HEIGHT_API_URL = `${config.apiUrl}/auth/Get_Height/`;
const COMPLEXION_STATUS_API_URL = `${config.apiUrl}/auth/Get_Complexion/`;

// Calculate the minimum date of birth for age 18
const getMinDOB = () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  return today.toISOString().split("T")[0];
};

// ZOD Schema
const schema = zod
  .object({
    name: zod.string().min(3, "Name is required"),
    maritalStatus: zod.string().min(1, "Marital Status is required"),
    dob: zod
      .string()
      .min(1, "Date of Birth is required")
      .refine((val) => new Date(val) <= new Date(getMinDOB()), {
        message: "You must be at least 18 years old",
      }),
    height: zod.string().min(1, "Height is required"),
    complexion: zod.string().min(1, "Complexion is required"),
  })
  .required();

interface BasicDetailsProps {
  onNext: () => void;
  onClose: () => void;
}

// React Hook Form input type props
interface FormInputs {
  name: string;
  maritalStatus: string;
  dob: string;
  height: string;
  complexion: string;
}

interface HeightOption {
  height_id: number;
  height_description: string;
}

interface MaritalStatusOption {
  marital_sts_id: number;
  marital_sts_name: string;
}

interface ComplexionOption {
  complexion_id: number;
  complexion_description: string;
}

export const BasicDetails: React.FC<BasicDetailsProps> = ({ onClose }) => {
  // Navigate to next page
  const navigate = useNavigate();

  // Age Message
  const [ageMessage, setAgeMessage] = useState("");

  // Marital Status Options
  const [maritalStatusOptions, setMaritalStatusOptions] = useState<
    MaritalStatusOption[]
  >([]);
  const [heightOptions, setHeightOptions] = useState<HeightOption[]>([]);
  const [complexionOptions, setComplexionOptions] = useState<
    ComplexionOption[]
  >([]);
  const [profileowner, setProfileOwner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission status

  // Get the value from sessionStorage
  useEffect(() => {
    const profileowner = sessionStorage.getItem("profile_owner");
    setProfileOwner(profileowner);
  }, []);

  // React Hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormInputs>({ resolver: zodResolver(schema) });

  // Fetch marital status options
  useEffect(() => {
    const fetchMaritalStatus = async () => {
      try {
        const response = await axios.post(MARITAL_STATUS_API_URL);
        const options = Object.values(response.data) as MaritalStatusOption[];
        setMaritalStatusOptions(options);
      } catch (error) {
        console.error("Error fetching marital status options:", error);
      }
    };
    fetchMaritalStatus();
  }, []);

  useEffect(() => {
    const fetchHeight = async () => {
      try {
        const response = await axios.post(HEIGHT_API_URL);
        const options = Object.values(response.data) as HeightOption[];
        setHeightOptions(options);
      } catch (error) {
        console.error("Error fetching height options:", error);
      }
    };
    fetchHeight();
  }, []);

  // Fetch complexion options
  useEffect(() => {
    const fetchComplexionStatus = async () => {
      try {
        const response = await axios.post(COMPLEXION_STATUS_API_URL);
        const options = Object.values(response.data) as ComplexionOption[];
        setComplexionOptions(options);
      } catch (error) {
        console.error("Error fetching complexion options:", error);
      }
    };
    fetchComplexionStatus();
  }, []);

  // Calculate age based on date of birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Watch the date input field and update age message
  const dateOfBirth = watch("dob");
  useEffect(() => {
    if (dateOfBirth) {
      const age = calculateAge(dateOfBirth);
      setAgeMessage(`Your age is ${age}`);
      sessionStorage.setItem("userAge", age.toString()); // Convert age to string before storing
    } else {
      setAgeMessage("");
      sessionStorage.removeItem("userAge"); // Remove age from session storage if date of birth is not provided
    }
  }, [dateOfBirth]);

  // Watch the height input field and store height in session storage
  const height = watch("height");
  useEffect(() => {
    if (height) {
      sessionStorage.setItem("userHeight", height);
    }
  }, [height]);

  // Date Validation
  useEffect(() => {
    document.getElementById("date")!.setAttribute("max", getMinDOB());
  }, []);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsSubmitting(true); // Set isSubmitting to true when form submission starts

    try {
      console.log("Form Data: ", data);
      const profileId = sessionStorage.getItem("profile_id");
      if (!profileId) {
        throw new Error("ProfileId not found in sessionStorage");
      }

      const postData = {
        ProfileId: profileId,
        Profile_name: data.name,
        Profile_marital_status: data.maritalStatus,
        Profile_dob: data.dob,
        Profile_height: data.height,
        Profile_complexion: data.complexion,
      };

      console.log("Post Data: ", postData);

      const response = await axios.post(
        `${config.apiUrl}/auth/Registrationstep2/`,
        postData
      );
      console.log("Registration successful:", response.data);
      if (response.data.Status === 1) {
        const { profile_id } = response.data;
        sessionStorage.setItem("profile_id_new", profile_id);

        navigate("/ThankYou");
      } else {
        setIsSubmitting(false); // Set isSubmitting to false when form submission fails
        console.log("Registration unsuccessful:", response.data);
      }
    } catch (error) {
      setIsSubmitting(false); // Set isSubmitting to false when there is an error
      console.error("Error submitting contact details:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-primary text-[22px] text-center mb-4 font-semibold">
        Great! Now some basic <br />
        details about your {profileowner}
      </h2>
      <div className="mb-5 space-y-5">
        <div>
          <input
            type="text"
            id="name"
            placeholder={`${profileowner} name`}
            className={`outline-none px-3 py-2 w-full text-primary border border-footer-text-gray rounded`}
            {...register("name")}
          />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div>
          <select
            id="maritalStatus"
            className={`text-ash font-medium block w-full px-3 py-2 border-[1px] border-footer-text-gray rounded-[4px] focus-visible:outline-none`}
            {...register("maritalStatus")}
          >
            <option value="" selected disabled>
              Select your Marital Status
            </option>
            {maritalStatusOptions.map((option) => (
              <option key={option.marital_sts_id} value={option.marital_sts_id}>
                {option.marital_sts_name}
              </option>
            ))}
          </select>
          {errors.maritalStatus && (
            <span className="text-red-500">{errors.maritalStatus.message}</span>
          )}
        </div>

        <div>
          <input
            type="date"
            id="date"
            placeholder="Date of Birth"
            className={`outline-none px-3 py-2 w-full text-primary border border-footer-text-gray rounded`}
            {...register("dob")}
          />
          {ageMessage && <p className="text-green-500">{ageMessage}</p>}
          {errors.dob && (
            <span className="text-red-500">{errors.dob.message}</span>
          )}
        </div>

        {/* <div>
          <input
            type="text"
            placeholder="Height in cms"
            className={`outline-none px-3 py-2 w-full text-primary border border-footer-text-gray rounded`}
            {...register("height")}
          />
          {errors.height && <span className="text-red-500">{errors.height.message}</span>}
        </div> */}

        <div>
          <select
            id="height"
            className={`text-ash font-medium block w-full px-3 py-2 border-[1px] border-footer-text-gray rounded-[4px] focus-visible:outline-none`}
            {...register("height")}
          >
            <option value="" selected disabled>
              Select your Height
            </option>
            {heightOptions.map((option) => (
              <option key={option.height_id} value={option.height_id}>
                {option.height_description}
              </option>
            ))}
          </select>
          {errors.height && (
            <span className="text-red-500">{errors.height.message}</span>
          )}
        </div>

        <div>
          <select
            id="complexion"
            className={`text-ash font-medium block w-full px-3 py-2 border-[1px] border-footer-text-gray rounded-[4px] focus-visible:outline-none`}
            {...register("complexion")}
          >
            <option value="" selected disabled>
              Select your complexion
            </option>
            {complexionOptions.map((option) => (
              <option key={option.complexion_id} value={option.complexion_id}>
                {option.complexion_description}
              </option>
            ))}
          </select>
          {errors.complexion && (
            <span className="text-red-500">{errors.complexion.message}</span>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-[10px] px-[24px] bg-gradient text-white rounded-[6px] mt-2"
        disabled={isSubmitting} // Disable the button when form is submitting
      >
        {isSubmitting ? "Submitting..." : "Save Details"}
      </button>

      <IoIosCloseCircle
        onClick={onClose}
        className="absolute top-[-15px] right-[-15px] text-[30px] text-black bg-white rounded-full flex items-center cursor-pointer hover:text-white hover:bg-black"
      />
    </form>
  );
};
