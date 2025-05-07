import { useContext } from "react";
import { VoteContext } from "./VoteContext";

export const useVote = () => {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error("useVote doit être utilisé dans un VoteProvider");
  }
  return context;
};