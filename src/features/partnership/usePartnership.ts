import { useState, useEffect, useCallback } from "react";
import {
  createPartnership,
  joinPartnership,
  getPartnerInfo,
  dissolvePartnership,
  getPartnershipStatus,
  PartnerInfo,
} from "./api";

export function usePartnership() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPartnership, setHasPartnership] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const result = await getPartnershipStatus();
      setHasPartnership(result.hasPartnership);
      setStatus(result.status);
      setInviteCode(result.inviteCode);
      setPartnerId(result.partnerId);
    } catch {
      // User might not be authenticated
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const create = async () => {
    setIsLoading(true);
    try {
      const result = await createPartnership();
      setHasPartnership(true);
      setStatus("pending");
      setInviteCode(result.invite_code ?? null);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const join = async (code: string) => {
    setIsLoading(true);
    try {
      const result = await joinPartnership(code);
      setHasPartnership(true);
      setStatus("active");
      setPartnerId(result.partner_id ?? null);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPartnerInfo = async () => {
    setIsLoading(true);
    try {
      const info = await getPartnerInfo();
      setPartnerInfo(info);
      return info;
    } finally {
      setIsLoading(false);
    }
  };

  const dissolve = async () => {
    setIsLoading(true);
    try {
      await dissolvePartnership();
      setHasPartnership(false);
      setStatus(null);
      setInviteCode(null);
      setPartnerId(null);
      setPartnerInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    hasPartnership,
    status,
    inviteCode,
    partnerId,
    partnerInfo,
    create,
    join,
    fetchPartnerInfo,
    dissolve,
    refreshStatus,
  };
}

