import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { CircularProgress } from "@material-ui/core";

import MotionsForm from "../../../components/Motions/Form";
import { MOTION } from "../../../apollo/client/queries";

const Edit = () => {
  const { query } = useRouter();
  const [motion, setMotions] = useState<Motion>();

  const [getMotionRes, motionRes] = useLazyQuery(MOTION);

  useEffect(() => {
    if (query.id)
      getMotionRes({
        variables: { id: query.id },
      });
  }, [query.id]);

  useEffect(() => {
    setMotions(motionRes.data ? motionRes.data.motion : motionRes.data);
  }, [motionRes.data]);

  if (motion) return <MotionsForm motion={motion} isEditing={true} />;

  return <CircularProgress style={{ color: "white" }} />;
};

export default Edit;
