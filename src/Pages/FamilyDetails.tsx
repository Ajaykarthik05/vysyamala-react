import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import ContentBlackCard from "../Components/RegistrationForm/ContentBlackCard";
import InputField from "../Components/RegistrationForm/InputField";
import SideContent from "../Components/RegistrationForm/SideContent";
import arrow from "../assets/icons/arrow.png";
import config from '../API'; // Import the configuration file


// Define validation schema with zod
const schema = zod.object({
  fathername: zod.string().min(3, "Father name is required"),
  fatherOccupation: zod.string().min(3, "Father's Occupation is required"),
  mothername: zod.string().min(3, "Mother name is required"),
  familyname: zod.string().min(3, "Family name is required"),
  aboutmyself: zod.string().min(3, "Required"),
  myhobbies: zod.string().min(3, "Required"),
  bloodGroup: zod.string().min(3, "Blood Group Required"),
  motherOccupation: zod.string().min(3, "Mother's Occupation is required"),
  brother: zod.number().min(0, "Brother count is required"),
  marriedBrother: zod.number().optional(),
  sister: zod.number().min(0, "Sister count is required"),
  marriedSister: zod.number().min(0, "Married Sister count is required").optional(),
  familyType: zod.string().min(1, "Family Type is required"),
  familyValue: zod.string().min(1, "Family Value is required"),
  familyStatus: zod.string().min(1, "Family Status is required"),
  propertyDetails: zod.string().optional(),
  propertyWorth: zod.string().optional(),
  suyaGothram: zod.string().optional(),
  uncleGothram: zod.string().optional(),
  ancestorOrigin: zod.string().optional(),
  aboutMyFamily: zod.string().optional(),
}).refine(
  (data) => data.brother === 0 || (data.brother > 0 && data.marriedBrother !== undefined),
  {
    message: "Married Brother count is required if there are brothers",
    path: ["marriedBrother"],
  }
).refine(
  (data) => data.sister === 0 || (data.sister > 0 && data.marriedSister !== undefined),
  {
    message: "Married Sister count is required if there are sisters",
    path: ["marriedSister"],
  }
);

interface FamilyDetailsInputs {
  fathername: string;
  fatherOccupation: string;
  mothername?: string;
  familyname?: string;
  aboutmyself?: string;
  myhobbies?: string;
  motherOccupation?: string;
  familyType?: string;
  familyValue?: string;
  familyStatus?: string;
  propertyDetails?: string;
  propertyWorth?: string;
  suyaGothram?: string;
  uncleGothram?: string;
  ancestorOrigin?: string;
  aboutMyFamily?: string;
  brother: number;
  marriedBrother: number;
  sister: number;
  marriedSister: number;
  bloodGroup?: string;
  physicallyChallenged?: string;
  defectDetails?: string;
}

interface Occupation {
  occupation_id: number;
  occupation_description: string;
}

interface PropertyWorth {
  property_id: number;
  property_description: string;
}

interface FamilyType {
  family_id: number;
  family_description: string;
}

interface FamilyStatus {
  family_status_id: number;
  family_status_name: string;
  family_status_description: string;
}

interface FamilyValue {
  family_value_id: number;
  family_value_name: string;
}



const FamilyDetails: React.FC = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FamilyDetailsInputs>({
    resolver: zodResolver(schema),
  });

  const [selectedBrother, setSelectedBrother] = useState<number | null>(null);
  const [selectedMarriedBrother, setSelectedMarriedBrother] = useState<number | null>(null);
  const [selectedSister, setSelectedSister] = useState<number | null>(null);
  const [selectedMarriedSister, setSelectedMarriedSister] = useState<number | null>(null);
  const [selectedFamilyType, setSelectedFamilyType] = useState<string | null>(null);
  const [selectedFamilyValue, setSelectedFamilyValue] = useState<string | null>(null);
  const [selectedFamilyStatus, setSelectedFamilyStatus] = useState<string | null>(null);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [propertyworth, setPropertyworth] = useState<PropertyWorth[]>([]);
  const [familyTypes, setFamilyTypes] = useState<FamilyType[]>([]);
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus[]>([]);
  const [familyValue, setFamilyValue] = useState<FamilyValue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission status

  const physicallyChallengedValue = watch("physicallyChallenged");




  const profileId = sessionStorage.getItem('profile_id_new');

  useEffect(() => {
    const fetchFamilyData = async () => {
      if (profileId) {
        try {
          const requestData = {
            profile_id: profileId,
            page_id: 3
          };

          const response = await axios.post(
            `${config.apiUrl}/auth/Get_save_details/`,
            requestData,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('API Response:', response.data);

          const profileData = response.data.data;

          console.log('Profile Data:', profileData);

          // Set form values here after fetching data
          setValue('fathername', profileData.father_name);
          setValue('fatherOccupation', profileData.father_occupation);
          setValue('mothername', profileData.mother_name);
          setValue('motherOccupation', profileData.mother_occupation);
          setValue('familyname', profileData.family_name);
          setValue('aboutmyself', profileData.about_self);
          setValue('myhobbies', profileData.hobbies);
          setValue('bloodGroup', profileData.blood_group);

          // Handle radio button for physically challenged
          setValue('physicallyChallenged', profileData.Pysically_changed === 'yes' ? 'yes' : 'no');

          // Set brother and sister values based on the fetched data


          const numberOfBrothers = parseInt(profileData.no_of_brother);
          const numberOfSisters = parseInt(profileData.no_of_sister);
          const numberOfMarriedSisters = parseInt(profileData.no_of_sis_married);
          const numberOfMarriedBrother = parseInt(profileData.no_of_bro_married);

          setValue('brother', numberOfBrothers);
          setValue('sister', numberOfSisters);
          setValue('marriedSister', numberOfMarriedSisters);
          setValue('marriedBrother', numberOfMarriedBrother);

          setSelectedBrother(numberOfBrothers);
          setSelectedSister(numberOfSisters);
          setSelectedMarriedSister(numberOfMarriedSisters);
          setSelectedMarriedBrother(numberOfMarriedBrother);



          // Set family type, value, and status
          setValue('familyType', profileData.family_type);
          setSelectedFamilyType(profileData.family_type);

          setValue('familyValue', profileData.family_value);
          setSelectedFamilyValue(profileData.family_value);

          setValue('familyStatus', profileData.family_status);
          setSelectedFamilyStatus(profileData.family_status);

          // Set property details, suya gothram, uncle gothram, ancestor origin, about family
          setValue('propertyDetails', profileData.property_details);
          setValue('propertyWorth', profileData.property_worth);
          setValue('suyaGothram', profileData.suya_gothram);
          setValue('uncleGothram', profileData.uncle_gothram);
          setValue('ancestorOrigin', profileData.ancestor_origin);
          setValue('aboutMyFamily', profileData.about_family);

        } catch (error) {
          console.error('Error fetching family data:', error);
        }
      } else {
        console.warn('Profile ID not found in sessionStorage');
      }
    };

    fetchFamilyData();
  }, [profileId, setValue]);





  useEffect(() => {
    const fetchOccupations = async () => {
      try {
        const response = await axios.post(`${config.apiUrl}/auth/Get_Parent_Occupation/`);
        const options = Object.values(response.data) as Occupation[];
        setOccupations(options);
      } catch (error) {
        console.error("Error fetching marital status options:", error);
      }
    };
    fetchOccupations();
  }, []);

  useEffect(() => {
    const fetchPropertyworth = async () => {
      try {
        const response = await axios.post(`${config.apiUrl}/auth/Get_Property_Worth/`);
        const options = Object.values(response.data) as PropertyWorth[];
        setPropertyworth(options);
      } catch (error) {
        console.error("Error fetching property worth options:", error);
      }
    };
    fetchPropertyworth();
  }, []);

  useEffect(() => {
    const fetchFamilyTypes = async () => {
      try {
        const response = await axios.post(`${config.apiUrl}/auth/Get_FamilyType/`);
        const data = response.data;
        const familyTypesArray = Object.values(data) as FamilyType[];
        setFamilyTypes(familyTypesArray);
      } catch (error) {
        console.error("Error fetching family types:", error);
      }
    };

    fetchFamilyTypes();
  }, []);

  useEffect(() => {
    const fetchFamilyStatus = async () => {
      try {
        const response = await axios.post(`${config.apiUrl}/auth/Get_FamilyStatus/`);
        const data = response.data;
        const familyTypesArray = Object.values(data) as FamilyStatus[];
        setFamilyStatus(familyTypesArray);
      } catch (error) {
        console.error("Error fetching family status:", error);
      }
    };

    fetchFamilyStatus();
  }, []);



  useEffect(() => {
    const fetchFamilyValue = async () => {
      try {
        const response = await axios.post(`${config.apiUrl}/auth/Get_FamilyValue/`);
        const data = response.data;
        const familyTypesArray = Object.values(data) as FamilyValue[];
        setFamilyValue(familyTypesArray);
      } catch (error) {
        console.error("Error fetching family value:", error);
      }
    };

    fetchFamilyValue();
  }, []);

  

  const buttonClass = (isSelected: boolean) => isSelected ? "bg-secondary text-white" : "border-gray hover:bg-secondary hover:text-white";

  const handleFamilyTypeChange = (value: string) => {
    setSelectedFamilyType(value);
    setValue("familyType", value, { shouldValidate: true });
  };

  const handleFamilyValueChange = (value: string) => {
    setSelectedFamilyValue(value);
    setValue("familyValue", value, { shouldValidate: true });
  };

  const handleFamilyStatusChange = (value: string) => {
    setSelectedFamilyStatus(value);
    setValue("familyStatus", value, { shouldValidate: true });
  };

  const handleBrotherChange = (value: number) => {
    setSelectedBrother(value);
    setValue("brother", value, { shouldValidate: true });
    setSelectedMarriedBrother(null); // Reset married brother selection when brother selection changes
  };

  const handleMarriedBrotherChange = (value: number) => {
    setSelectedMarriedBrother(value);
    setValue("marriedBrother", value, { shouldValidate: true });
  };

  const handleSisterChange = (value: number) => {
    setSelectedSister(value);
    setValue("sister", value, { shouldValidate: true });
    setSelectedMarriedSister(null); // Reset married sister selection when sister selection changes
  };

  const handleMarriedSisterChange = (value: number) => {
    setSelectedMarriedSister(value);
    setValue("marriedSister", value, { shouldValidate: true });
  };


  const onSubmit: SubmitHandler<FamilyDetailsInputs> = async (data) => {

    try {
      // Format the data as expected by the backend
      const profileId = sessionStorage.getItem("profile_id_new");
      if (!profileId) {
        throw new Error("ProfileId not found in sessionStorage");
      }
      const formattedData = {
        profile_id: profileId, // Replace with actual profile ID
        father_name: data.fathername,
        father_occupation: data.fatherOccupation,
        mother_name: data.mothername,
        mother_occupation: data.motherOccupation,
        family_name: data.familyname,
        about_self: data.aboutmyself,
        hobbies: data.myhobbies,
        blood_group: data.bloodGroup,
        Pysically_changed: physicallyChallengedValue,
        no_of_brother: data.brother,
        no_of_bro_married: data.marriedBrother || 0,
        no_of_sister: data.sister,
        no_of_sis_married: data.marriedSister || 0,
        family_type: data.familyType,
        family_value: data.familyValue,
        family_status: data.familyStatus,
        about_family:data.aboutMyFamily,
        property_worth:data.propertyWorth,
        property_details:data.propertyDetails
        
        // Include other fields as necessary
      };

      console.log("Formatted Data:", formattedData);


      console.log("Formatted Data:", formattedData);

      setIsSubmitting(true);
      const response = await axios.post(`${config.apiUrl}/auth/Family_registration/`, formattedData);
      setIsSubmitting(false);

      if (response.data.Status === 1) {
        navigate("/EduDetails");
      } else {
        // Handle error or show message to the user
        console.error("Error: Response status is not 1", response.data);
      }
    } catch (error) {
      console.error("Error submitting form data:", error);
      setIsSubmitting(false);
    }
  };


  useEffect(()=>{
    window.scrollTo(0,0)
  },[])




  return (
    <div className="pb-20">
      <ContentBlackCard
        heading="Family Details"
        desc="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis"
      />

      <div className="container mt-5 flex justify-between space-x-24">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5 mb-5">
          {/* Input fields for Father and Mother details */}
          <div>
            <InputField label="Father name" required {...register("fathername")} />
            {errors.fathername && <span className="text-red-500">{errors.fathername.message}</span>}
          </div>

          <div>
            <label htmlFor="fatheroccupation" className="block mb-1">
              Father Occupation
            </label>
            <select
              id="fatheroccupation"
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
              defaultValue=""
              {...register("fatherOccupation")}
            >
              <option value="" disabled selected>
                -- Select Occupation --
              </option>
              {occupations.map((occupation) => (
                <option key={occupation.occupation_id} value={occupation.occupation_description}>
                  {occupation.occupation_description}
                </option>
              ))}
            </select>
            {errors.fatherOccupation && (
              <span className="text-red-500">{errors.fatherOccupation.message}</span>
            )}
          </div>


          <div>
            <InputField label="Mother name" required {...register("mothername")} />
            {errors.mothername && <span className="text-red-500">{errors.mothername.message}</span>}
          </div>

          <div>
            <label htmlFor="motheroccupation" className="block mb-1">
              Mother Occupation
            </label>
            <select
              id="motheroccupation"
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
              defaultValue=""
              {...register("motherOccupation")}
            >
              <option value="" disabled>
                -- Select Occupation --
              </option>
              {occupations.map((occupation) => (
                <option key={occupation.occupation_id} value={occupation.occupation_description}>
                  {occupation.occupation_description}
                </option>
              ))}
            </select>
            {errors.motherOccupation && (
              <span className="text-red-500">{errors.motherOccupation.message}</span>
            )}
          </div>


          <div>
            <InputField label="Family name" required {...register("familyname")} />
            {errors.familyname && <span className="text-red-500">{errors.familyname.message}</span>}
          </div>

          <div>
            <label htmlFor="aboutmyself">About Myself</label>
            <textarea
              id="aboutmyself"
              className="outline-none px-3 py-2 w-full text-primary border border-footer-text-gray rounded"
              {...register("aboutmyself")}
            />
            {errors.aboutmyself && <span className="text-red-500">{errors.aboutmyself.message}</span>}
          </div>

          <div>
            <label htmlFor="myhobbies">My Hobbies</label>
            <textarea
              id="myhobbies"
              className="outline-none px-3 py-2 w-full text-primary border border-footer-text-gray rounded"
              {...register("myhobbies")}
            />
            {errors.myhobbies && <span className="text-red-500">{errors.myhobbies.message}</span>}
          </div>


          <div>
            <InputField label="Blood Group" required {...register("bloodGroup")} />
            {errors.bloodGroup && <span className="text-red-500">{errors.bloodGroup.message}</span>}
          </div>






          {/* <div>
            <label htmlFor="bloodGroup" className="block mb-1">
              Blood Group
            </label>
            <select
              id="bloodGroup"
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
              defaultValue=""
              {...register("bloodGroup")}
            >
              
              {bloodGroupOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.bloodGroup && <p>{errors.bloodGroup.message}</p>}

          </div> */}


          <div>
            <label>Physically Challenged</label>
            <div style={{ marginTop: '8px' }}>
              <label style={{ marginRight: '16px' }}>
                <input
                  type="radio"
                  value="yes"
                  {...register("physicallyChallenged", { required: true })}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("physicallyChallenged", { required: true })}
                />
                No
              </label>
            </div>
            {errors.physicallyChallenged && <span>This field is required</span>}
          </div>




          {physicallyChallengedValue === "yes" && (
            <div>
              <InputField label="Defect Details" />
            </div>
          )}




          {/* Brother and Sister selection */}
          <div className="mt-3 flex items-center space-x-48">
            <div>
              <h1 className="mb-3">Brother</h1>
              <div className="flex flex-col">
                <div className="inline-flex rounded">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`px-5 py-3 text-sm font-medium border ${buttonClass(selectedBrother === num)}`}
                      onClick={() => handleBrotherChange(num)}
                    >
                      {num === 5 ? "5+" : num}
                    </button>
                  ))}
                </div>
                {errors.brother && <span className="text-red-500">{errors.brother.message}</span>}
              </div>
            </div>

            {selectedBrother !== null && selectedBrother > 0 && (
              <div>
                <h1 className="mb-3">Married</h1>
                <div className="flex flex-col">
                  <div className="inline-flex rounded">
                    {[...Array(Math.min(selectedBrother + 1, 6)).keys()].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`px-10 py-3 text-sm font-medium border ${buttonClass(selectedMarriedBrother === num)}`}
                        onClick={() => handleMarriedBrotherChange(num)}
                      >
                        {num === 5 ? "5+" : num}
                      </button>
                    ))}
                  </div>
                  {errors.marriedBrother && <span className="text-red-500">{errors.marriedBrother.message}</span>}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center space-x-48">
            <div>
              <h1 className="mb-3">Sister</h1>
              <div className="flex flex-col">
                <div className="inline-flex rounded">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`px-5 py-3 text-sm font-medium border ${buttonClass(selectedSister === num)}`}
                      onClick={() => handleSisterChange(num)}
                    >
                      {num === 5 ? "5+" : num}
                    </button>
                  ))}
                </div>
                {errors.sister && <span className="text-red-500">{errors.sister.message}</span>}
              </div>
            </div>

            {selectedSister !== null && selectedSister > 0 && (
              <div>
                <h1 className="mb-3">Married</h1>
                <div className="flex flex-col">
                  <div className="inline-flex rounded">
                    {[...Array(Math.min(selectedSister + 1, 6)).keys()].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`px-10 py-3 text-sm font-medium border ${buttonClass(selectedMarriedSister === num)}`}
                        onClick={() => handleMarriedSisterChange(num)}
                      >
                        {num === 5 ? "5+" : num}
                      </button>
                    ))}
                  </div>
                  {errors.marriedSister && <span className="text-red-500">{errors.marriedSister.message}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Family Type Section */}
          <div className="mt-3">
            <h1 className="mb-3">Family Type</h1>
            <div className="flex flex-col">
              <div className="w-full inline-flex rounded">
                {familyTypes.map((type) => (
                  <button
                    key={type.family_id}
                    type="button"
                    title={type.family_description}
                    className={`w-full px-5 py-3 text-sm font-medium border ${buttonClass(selectedFamilyType === type.family_description)}`}
                    onClick={() => handleFamilyTypeChange(type.family_description)}
                  >
                    {type.family_description}
                  </button>
                ))}
              </div>
              {errors.familyType && <span className="text-red-500">{errors.familyType.message}</span>}
            </div>
          </div>


          {/* Family Value Section */}
          <div className="mt-3">
            <h1 className="mb-3">Family Value</h1>
            <div className="flex flex-col">
              <div className="w-full inline-flex rounded">
                {familyValue.map((type) => (
                  <button
                    key={type.family_value_id}
                    type="button"
                    title={type.family_value_name}
                    className={`w-full px-5 py-3 text-sm font-medium border ${buttonClass(selectedFamilyValue === type.family_value_name)}`}
                    onClick={() => handleFamilyValueChange(type.family_value_name)}
                  >
                    {type.family_value_name}
                  </button>
                ))}
              </div>
              {errors.familyValue && <span className="text-red-500">{errors.familyValue.message}</span>}
            </div>
          </div>

          {/* Family Status Section */}
          <div className="mt-3">
            <h1 className="mb-3">Family Status</h1>
            <div className="flex flex-col">
              <div className="w-full inline-flex rounded">
                {familyStatus.map((type) => (
                  <button
                    key={type.family_status_id}
                    type="button"
                    title={type.family_status_description}
                    className={`w-full px-5 py-3 text-sm font-medium border ${buttonClass(selectedFamilyStatus === type.family_status_name)}`}
                    onClick={() => handleFamilyStatusChange(type.family_status_name)}
                  >
                    {type.family_status_name}
                  </button>
                ))}
              </div>
              {errors.familyStatus && <span className="text-red-500">{errors.familyStatus.message}</span>}
            </div>
          </div>






          {/* Additional Input Fields */}
          <div>
            <InputField label="Property Details" {...register("propertyDetails")} title="Enter details about the property here." />
          </div>

          <div>
            <label htmlFor="propertyWorth" className="block mb-1">
              Property Worth
            </label>
            <select
              id="propertyWorth"
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
              defaultValue=""
              {...register("propertyWorth")}
            >
              <option value="" disabled>
                -- Select Property Worth --
              </option>
              {propertyworth.map(property => (
                <option key={property.property_id} value={property.property_id}>
                  {property.property_description}
                </option>
              ))}
            </select>
            {/* {errors.motherOccupation && <span className="text-red-500">{errors.motherOccupation.message}</span>} */}
          </div>

          <div>
            <InputField label="Suya Gothram" {...register("suyaGothram")} />
          </div>

          <div>
            <InputField label="Uncle Gothram" {...register("uncleGothram")} />
          </div>

          <div>
            <InputField label="Ancestor Origin" {...register("ancestorOrigin")} title="Enter details about the ancestorOrgin here." />
          </div>

          <div>
            <label htmlFor="aboutMyFamily" className="block mb-1">
              About my Family
            </label>
            <textarea
              id="aboutMyFamily"
              rows={5}
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
              {...register("aboutMyFamily")}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="mt-7 flex justify-between">
            <div className="">
              <Link to="/ContactDetails">
                <button className="py-[10px] px-14 bg-white text-main font-semibold border-2 rounded-[6px] mt-2">
                  Back
                </button>
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link to="/EduDetails">

                <button className="py-[10px] px-14 bg-white text-main font-semibold rounded-[6px] mt-2">
                  Skip
                </button>
              </Link>

              <button type="submit" className="flex items-center py-[10px] px-14 bg-gradient text-white rounded-[6px] mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Next'}
                <span>
                  <img src={arrow} alt="next arrow" className="ml-2" />
                </span>
              </button>
            </div>
          </div>
        </form>
        <SideContent />
      </div>
    </div>
  );
};

export default FamilyDetails;
