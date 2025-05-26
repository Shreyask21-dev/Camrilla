'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config/config';

export default function useUserPlan() {
  const [planInfo, setPlanInfo] = useState(null);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const res = await axios.get(`${config.BASE_URL}user-plan`);
        if (res.data.code === 0) {
          setPlanInfo(res.data.data.userPlanDetails);
        }
      } catch (err) {
        console.error("Error fetching user plan via Axios:", err);
      }
    };

    fetchUserPlan();
  }, []);

  return planInfo;
}
