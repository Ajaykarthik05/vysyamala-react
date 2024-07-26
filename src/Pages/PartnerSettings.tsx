/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import ContentBlackCard from "../Components/RegistrationForm/ContentBlackCard";
import InputField from "../Components/RegistrationForm/InputField";
import SideContent from "../Components/RegistrationForm/SideContent";
import arrow from "../assets/icons/arrow.png";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import MatchingStars from "../Components/PartnerPreference/MatchingStars";
import axios from "axios";
import config from '../API'; // Import the configuration file


const PARTNER_API_URL = `${config.apiUrl}/auth/Partner_pref_registration/`

const schema = zod.object({
  age: zod.string().nonempty("Age is required"),
  heightFrom: zod.string().min(1, "Height From is required"),
  heightTo: zod.string().min(1, "Height To is required"),
  // education: zod.array(zod.string()).min(1, "Education is required"),
  // annualIncome: zod.array(zod.string()).min(1, "Annual Income is required"),
  chevvai: zod.string().min(1, "Chevvai option is required"),
  rehu: zod.string().min(1, "Rehu/Kethu option is required"),
}).required();

interface PartnerSettingsInputs {
  age: string;
  heightFrom: string;
  heightTo: string;
  education: string[];
  annualIncome: string[];
  chevvai: string;
  rehu: string;
  profession: string[];
  maritalStatus: string[];
  foreignInterest: string;
  nativeState?: string[];
  profilePhoto?: boolean;
  ageFrom?: string;
  ageTo?: string;
}

interface EduPref {
  Edu_Pref_id: number;
  Edu_name: string;
}

interface MaritalStatus {
  marital_sts_id: number;
  marital_sts_name: string;
}

interface AnnualIncome {
  income_id: number;
  income_description: string;
}

// interface BirthStar {
//   birth_id: number;
//   birth_star: string;
// }

interface MatchingStar {
  dest_rasi_id: number;
  dest_star_id: number;
  id: number;
  match_count: number;
  matching_porutham: string;
  matching_starname: string;
  matching_rasiname: string;
  protham_names: null | string[];
  source_star_id: number;
}

const PartnerSettings: React.FC = () => {
  const [eduPref, setEduPref] = useState<EduPref[]>([]);
  const [annualIncome, setAnnualIncome] = useState<AnnualIncome[]>([]);
  const [matchStars, setMatchStars] = useState<MatchingStar[][]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [selectedStarIds, setSelectedStarIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMaritalStatuses, setSelectedMaritalStatuses] = useState<string[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [selectedEducations, setSelectedEducations] = useState<string[]>([]);
  const [selectedAnnualIncomes, setSelectedAnnualIncomes] = useState<string[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(false);
  const [selectedNotWorking, setSelectedNotWorking] = useState(false);
  const [selectedNotMentioned, setSelectedNotMentioned] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<PartnerSettingsInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      foreignInterest: 'both' // Set default value here
    }
  });

  const [foreignInterestValue, setForeignInterestValue] = useState('both');
  const foreignInterest = watch("foreignInterest");

  useEffect(() => {
    setForeignInterestValue(foreignInterest);
  }, [foreignInterest]);

  const navigate = useNavigate();




  const handleMaritalStatusChange = (id: string, checked: boolean) => {
    const updatedStatuses = checked
      ? [...selectedMaritalStatuses, id]
      : selectedMaritalStatuses.filter(statusId => statusId !== id);

    setSelectedMaritalStatuses(updatedStatuses);
  };



  const handleEducationChange = (value: string, checked: boolean) => {
    const updatedEducations = checked
      ? [...selectedEducations, value]
      : selectedEducations.filter(education => education !== value);

    setSelectedEducations(updatedEducations);
  };

  const handleAnnualIncomeChange = (id: string, checked: boolean) => {
    const updatedIncomes = checked
      ? [...selectedAnnualIncomes, id]
      : selectedAnnualIncomes.filter(incomeId => incomeId !== id);

    setSelectedAnnualIncomes(updatedIncomes);
  };

  const handleProfessionChange = (value: string, checked: boolean) => {
    setSelectedProfessions(prevProfessions => {
      if (checked && !prevProfessions.includes(value)) {
        return [...prevProfessions, value];
      } else {
        return prevProfessions.filter(profession => profession !== value);
      }
    });

    // Handle other checkboxes as needed
    if (value === "business") {
      setSelectedBusiness(checked);
    } else if (value === "student") {
      setSelectedStudent(checked);
    } else if (value === "notWorking") {
      setSelectedNotWorking(checked);
    } else if (value === "notMentioned") {
      setSelectedNotMentioned(checked);
    }
  };

  const onSubmit: SubmitHandler<PartnerSettingsInputs> = async (data) => {
    setIsSubmitting(true);
    console.log('Form data:', data);
    const starIdsString = selectedStarIds.join(',');
    console.log(starIdsString);

    try {
      const profileId = sessionStorage.getItem("profile_id_new");
      if (!profileId) {
        throw new Error("ProfileId not found in sessionStorage");
      }

      const postData = {
        profile_id: profileId,
        pref_age_differences: data.age,
        pref_height_from: data.heightFrom,
        pref_height_to: data.heightTo,
        pref_marital_status1: selectedMaritalStatuses,
        pref_profession1: [
          ...(selectedProfessions.includes("employed") ? ["employed"] : []),
          ...(selectedBusiness ? ["business"] : []),
          ...(selectedStudent ? ["student"] : []),
          ...(selectedNotWorking ? ["notWorking"] : []),
          ...(selectedNotMentioned ? ["notMentioned"] : []),
        ],
        pref_education1: selectedEducations,
        pref_anual_income1: selectedAnnualIncomes,
        pref_chevvai: data.chevvai,
        pref_ragukethu: data.rehu,
        pref_foreign_intrest: foreignInterestValue,
        pref_porutham_star:starIdsString,
        status: "1"
      };

      console.log("Post Data:", postData);

      const response = await axios.post(PARTNER_API_URL, postData);
      console.log("Registration response:", response.data);

      if (response.data.Status === 1) {
        navigate('/MembershipPlan');
      } else {
        setIsSubmitting(false);
        console.log("Registration unsuccessful:", response.data);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error submitting contact details:", error);
    }
  };







  const profileId = sessionStorage.getItem('profile_id_new');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (profileId) {
        try {
          const requestData = {
            profile_id: profileId,
            page_id: 6
          };

          const response = await axios.post(`${config.apiUrl}/auth/Get_save_details/`, requestData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log("API Response:", response.data);

          const profileData = response.data.data;

          console.log("Profile Data:", profileData);

          // Set form values here after fetching data
          setValue("age", profileData.pref_age_differences);
          setValue("heightFrom", profileData.pref_height_from);
          setValue("heightTo", profileData.pref_height_to);
          setValue("maritalStatus", profileData.pref_marital_status);
          setValue("profession", profileData.pref_profession);
          setValue("education", profileData.pref_education);
          setValue("annualIncome", profileData.pref_anual_income);
          setValue("chevvai", profileData.pref_chevvai);
          setValue("rehu", profileData.pref_ragukethu);
          setValue("foreignInterest", profileData.pref_foreign_intrest);

        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      } else {
        console.warn("Profile ID not found in sessionStorage");
      }
    };

    fetchProfileData();
  }, [profileId, setValue]);

  useEffect(() => {
    const fetchMaritalStatuses = async () => {
      try {
        const response = await axios.post<{ [key: string]: MaritalStatus }>(`${config.apiUrl}/auth/Get_Marital_Status/`);
        const options = Object.values(response.data);
        setMaritalStatuses(options);
      } catch (error) {
        console.error('Error fetching marital statuses:', error);
      }
    };

    fetchMaritalStatuses();
  }, []);

  useEffect(() => {
    const fetchEduPref = async () => {
      try {
        const response = await axios.post(`${config.apiUrl}/auth/Get_Edu_Pref/`);
        const options = Object.values(response.data) as EduPref[];
        console.log(options);
        setEduPref(options);
      } catch (error) {
        console.error('Error fetching Edu Pref options:', error);
      }
    };
    fetchEduPref();
  }, []);

  useEffect(() => {
    const fetchAnnualIncome = async () => {
      try {
        const response = await axios.post(`${config.apiUrl}/auth/Get_Annual_Income/`);
        const options = Object.values(response.data) as AnnualIncome[];
        setAnnualIncome(options);
      } catch (error) {
        console.error('Error fetching Annual Income options:', error);
      }
    };
    fetchAnnualIncome();
  }, []);

  const storedBirthStar = sessionStorage.getItem("selectedstar");
  const storedGender = sessionStorage.getItem("gender");

  console.log(storedBirthStar);
  console.log(storedGender);

  useEffect(() => {
    if (storedBirthStar && storedGender) {
      const fetchMatchingStars = async () => {
        try {
          const response = await axios.post(`${config.apiUrl}/auth/Get_Matchstr_Pref/`, {
            birth_star_id: storedBirthStar,
            gender: storedGender,
          });

          const matchCountArrays: MatchingStar[][] = Object.values(response.data).map((matchCount: any) => matchCount);
          setMatchStars(matchCountArrays);
          console.log('Response from server:', matchCountArrays);
        } catch (error) {
          console.error('Error fetching matching star options:', error);
        }
      };
      fetchMatchingStars();
    }
  }, [storedBirthStar, storedGender]);

  useEffect(() => {
    const storedHeight = sessionStorage.getItem("userHeight");

    if (storedHeight) {
      if (storedGender === 'male') {
        setValue("heightTo", storedHeight);
      } else {
        setValue("heightFrom", storedHeight);
      }
    }
  }, [setValue]);

  const handleCheckboxChange = (updatedIds: string[]) => {
    setSelectedStarIds(updatedIds);
    console.log(selectedStarIds);
 

  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // console.log(selectedStarIds);
  // console.log(selectedMaritalStatuses);
  // console.log(selectedProfessions);
  // console.log(selectedEducations);
  // console.log(selectedAnnualIncomes);


  return (
    <div className="pb-20">
      <ContentBlackCard
        heading={"Partner Preference"}
        desc="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis"
      />

      <div className="container mt-5 flex justify-between space-x-24">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5 mb-5">
          <h5 className="text-[24px] font-semibold">Advanced Search</h5>

          <div className="flex justify-between items-center">

            <div>
              {/* <h5 className="text-[18px] text-primary font-semibold">Age</h5> */}
              <div className="flex items-center space-x-5">
                {/* <InputField label={""} name={""} placeholder="From" />
                <InputField label={""} name={""} placeholder="To" /> */}

                <div>
                  <label htmlFor="nativeState" className="block mb-1">
                    Age Difference
                  </label>
                  <select
                    id="age"
                    className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
                    {...register("age")}
                  >
                    <option value="" selected disabled>
                      -- Select your Age --
                    </option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                  </select>
                  {errors.age && <span className="text-red-500">{errors.age.message}</span>}
                </div>
              </div>
            </div>



            {/* 
            <div>
              <h5 className="text-[18px] text-primary font-semibold">Age</h5>
              <div className="flex items-center space-x-5">
                <div>
                  <InputField label={""} placeholder="From" {...register("ageFrom")} />
                  {errors.ageFrom && <span className="text-red-500">{errors.ageFrom.message}</span>}
                </div>
                <div>
                  <InputField label={""} placeholder="To" {...register("ageTo")} />
                  {errors.ageTo && <span className="text-red-500">{errors.ageTo.message}</span>}
                </div>
              </div>
            </div> */}





            <div>
              <h5 className="text-[18px] text-primary font-semibold">Height</h5>
              <div className="flex items-center space-x-5">
                <div>
                  <InputField label={""} placeholder="From" {...register("heightFrom")} />
                  {errors.heightFrom && <span className="text-red-500">{errors.heightFrom.message}</span>}
                </div>
                <div>
                  <InputField label={""} placeholder="To" {...register("heightTo")} />
                  {errors.heightTo && <span className="text-red-500">{errors.heightTo.message}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Marital Status */}
          {/* Marital Status */}
          <div>
            <h5 className="text-[18px] text-primary font-semibold mb-2">Marital Status</h5>
            <div className="flex justify-between items-center">
              {maritalStatuses.map(status => (
                <div key={status.marital_sts_id}>
                  <input
                    type="checkbox"
                    id={`maritalStatus-${status.marital_sts_id}`}
                    value={status.marital_sts_id.toString()}
                    checked={selectedMaritalStatuses.includes(status.marital_sts_id.toString())}
                    onChange={(e) => handleMaritalStatusChange(status.marital_sts_id.toString(), e.target.checked)}
                  />
                  <label htmlFor={`maritalStatus-${status.marital_sts_id}`}>{status.marital_sts_name}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Profession */}
          {/* Profession */}
          <div>
            <h5 className="text-[18px] text-primary font-semibold mb-2">Profession</h5>
            <div className="flex justify-between items-center">
              <div>
                <input
                  type="checkbox"
                  id="employed"
                  value="employed"
                  checked={selectedProfessions.includes("employed")}
                  onChange={(e) => handleProfessionChange("employed", e.target.checked)}
                />
                <label htmlFor="employed" className="pl-1">Employed</label>
              </div>

              <div>
                <input
                  type="checkbox"
                  id="business"
                  value="business"
                  checked={selectedProfessions.includes("business")}
                  onChange={(e) => handleProfessionChange("business", e.target.checked)}
                />
                <label htmlFor="business" className="pl-1">Business</label>
              </div>

              <div>
                <input
                  type="checkbox"
                  id="student"
                  value="student"
                  checked={selectedProfessions.includes("student")}
                  onChange={(e) => handleProfessionChange("student", e.target.checked)}
                />
                <label htmlFor="student" className="pl-1">Student</label>
              </div>

              <div>
                <input
                  type="checkbox"
                  id="notWorking"
                  value="notWorking"
                  checked={selectedProfessions.includes("notWorking")}
                  onChange={(e) => handleProfessionChange("notWorking", e.target.checked)}
                />
                <label htmlFor="notWorking" className="pl-1">Not Working</label>
              </div>

              <div>
                <input
                  type="checkbox"
                  id="notMentioned"
                  value="notMentioned"
                  checked={selectedProfessions.includes("notMentioned")}
                  onChange={(e) => handleProfessionChange("notMentioned", e.target.checked)}
                />
                <label htmlFor="notMentioned" className="pl-1">Not Mentioned</label>
              </div>
            </div>
            {errors.profession && (
              <span className="text-red-500">{errors.profession.message}</span>
            )}
          </div>



          {/* Education */}
          <div>
            <label className="text-[18px] text-primary font-semibold mb-2">Education</label>
            <div className="flex flex-wrap gap-4">
              {eduPref.map((option) => (
                <div key={option.Edu_Pref_id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`education-${option.Edu_Pref_id}`}
                    value={option.Edu_name}
                    checked={selectedEducations.includes(option.Edu_name)}
                    onChange={(e) => handleEducationChange(option.Edu_name, e.target.checked)}
                  />
                  <label htmlFor={`education-${option.Edu_Pref_id}`} className="pl-1">
                    {option.Edu_name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Annual Income */}
          <div>
            <label className="text-[18px] text-primary font-semibold mb-2">Annual Income</label>
            <div className="grid grid-rows-1 grid-cols-5">
              {annualIncome.map((option) => (
                <div key={option.income_id} className="mb-2">
                  <input
                    type="checkbox"
                    id={`annualIncome-${option.income_id}`}
                    value={option.income_id.toString()}
                    checked={selectedAnnualIncomes.includes(option.income_id.toString())}
                    onChange={(e) => handleAnnualIncomeChange(option.income_id.toString(), e.target.checked)}
                  />
                  <label htmlFor={`annualIncome-${option.income_id}`} className="pl-1">
                    {option.income_description}
                  </label>
                </div>
              ))}
            </div>
          </div>


          {/* Dhosam */}
          {/* <div>
            <h5 className="text-[18px] text-primary font-semibold mb-2">Dhosam</h5>
            <select
              id="dhosam"
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
              {...register("dhosam")}
              defaultValue="unknown" // Set default value to "unknown"
            >
              <option value="chevvai">Chevvai</option>
              <option value="rehu">Rehu / Ketu</option>
              <option value="unknown">Unknown</option>
            </select>
            {errors.dhosam && <span className="text-red-500">{errors.dhosam.message}</span>}
          </div> */}
          <div>
            <label htmlFor="chevvaiDhosam" className="block mb-1">
              Chevvai
            </label>
            <select
              id="chevvaiDhosam"
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
              {...register("chevvai")}
            >
              <option value="" selected disabled>
                -- Select Chevvai --
              </option>
              {["UnKnown", "Yes", "No"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.chevvai && (
              <span className="text-red-500">{errors.chevvai.message}</span>
            )}
          </div>
          <div>
            <label htmlFor="Rehu" className="block mb-1">  Rehu / Ketu
            </label>
            <select
              id="Rehu"
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
              {...register("rehu")}
            >
              <option value="" selected disabled>
                -- Select Rehu / Ketu  --
              </option>
              {["UnKnown", "Yes", "No"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.rehu && (
              <span className="text-red-500">{errors.rehu.message}</span>
            )}
          </div>

          <div>
            <h5 className="text-[18px] text-primary font-semibold mb-2">Foreign Interest</h5>
            <select
              id="foreignInterest"
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
              {...register("foreignInterest", { required: "Foreign interest selection is required" })}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="both">Both</option>
            </select>
            {errors.foreignInterest && <span className="text-red-500">{errors.foreignInterest.message}</span>}
          </div>


          {/* <div>
            <label htmlFor="birthStar" className="block mb-1">
              Birth Star
            </label>
            <select
              id="birthStar"
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
              {...register("birthStar")}
            >
              <option value="" selected disabled>
                -- Select your Birth Star --
              </option>
              {birthStar.map((option) => (
                <option key={option.birth_id} value={option.birth_id}>
                  {option.birth_star}
                </option>
              ))}
            </select>
          </div> */}

          {/* Native State */}

          {/* Matching Star */}
          {/* <div>
            <label htmlFor="education" className="block mb-1">
              Matching Star
            </label>
            <select
              name="star"
              id="star"
              className="outline-none w-full px-4 py-1.5 border border-ashSecondary rounded"
            >
              <option value="" selected disabled>
                -- Select your Matching Star --
              </option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerela">Kerela</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
            </select>
          </div> */}



          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Other input fields */}
              <div className="justify-start items-center gap-x-5">
                {matchStars
                  .sort((a, b) => b[0].match_count - a[0].match_count)
                  .map((matchCountArray, index) => {
                    const starAndRasi = matchCountArray.map(star => ({
                      id: star.id.toString(),
                      star: star.matching_starname,
                      rasi: star.matching_rasiname,
                    }));

                    const matchCountValue = matchCountArray[0].match_count;

                    return (
                      <MatchingStars
                        key={index}
                        initialPoruthas={`No of porutham ${matchCountValue}`}
                        starAndRasi={starAndRasi}
                        selectedStarIds={selectedStarIds} // Pass selectedStarIds state
                        onCheckboxChange={handleCheckboxChange} // Pass the callback function
                      />
                    );
                  })}
              </div>
              {/* <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button> */}
            </form>
          </div>




          <div className="mt-7 flex justify-between">
            <div className="">
              {/* <Link to={"/"}>
                <button className="py-[10px] px-14 bg-white text-main font-semibold border-2 rounded-[6px] mt-2">
                  Back
                </button>
              </Link> */}
            </div>

            <div className="flex space-x-4">

              <button className="py-[10px] px-14 bg-white text-main font-semibold  rounded-[6px] mt-2">
                Cancel
              </button>

              {/* <button type="submit" className="flex items-center py-[10px] px-14 bg-gradient text-white rounded-[6px] mt-2">
                Find Match
                <span>
                  <img src={arrow} alt="next arrow" className="ml-2" />
                </span>
              </button> */}
              <button type="submit" className="flex items-center py-[10px] px-14 bg-gradient text-white rounded-[6px] mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Find Match'}
                {!isSubmitting && <span><img src={arrow} alt="next arrow" className="ml-2" /></span>}
              </button>
            </div>
          </div>

        </form>
        <SideContent />
      </div>
    </div>
  );
};

export default PartnerSettings;

