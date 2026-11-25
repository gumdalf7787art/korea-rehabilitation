import { notFound } from "next/navigation";
import Consult from "../page";
export default async function MemberBoard({params,searchParams}) {
  const { board } = await params;
  if (!["qa","insurance"].includes(board)) notFound();
  return <Consult searchParams={searchParams} board={board}/>;
}
