"use client";

import { useEffect, useState } from "react";
import { getUserId } from "@/lib/identity";

export function UserIdentityInput() {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  return <input type="hidden" name="userId" value={userId} />;
}
