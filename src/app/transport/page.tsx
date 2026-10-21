import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Transport & transfers" };
export default function TransportPage() {
  return <InfoPage title={<>The journey<br />between <em>places.</em></>} intro="Ground transport and transfers can be discussed as part of a trip plan. Vehicle, driver, operating conditions and price are confirmed with the supplier." sections={[
    { title: "Plan the practical details", body: "Tell us your arrival time, group size, luggage, accessibility requirements and preferred pace. Sample itineraries do not reserve a vehicle." },
    { title: "Local conditions matter", body: "Road access and travel times change with weather, events and local rules. Final transport arrangements are not confirmed until written supplier details are accepted." },
  ]} />;
}
