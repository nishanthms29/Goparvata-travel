import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Stays & accommodation" };
export default function HotelsPage() {
  return <InfoPage title={<>Stays picked<br />for your <em>kind of trip.</em></>} intro="We can help compare accommodation options as part of a custom travel enquiry. There is no hotel inventory or instant reservation connected to this site." sections={[
    { title: "Discuss what matters", body: "Share your preferred location, room type, accessibility needs and budget. A planner can include suitable options in a written quote after checking the supplier directly." },
    { title: "Confirm before paying", body: "Hotel name, room category, dates, meal plan, taxes, cancellation terms and supplier availability must all be explicit in a written confirmation. Do not treat sample package rates as a room offer." },
  ]} />;
}
