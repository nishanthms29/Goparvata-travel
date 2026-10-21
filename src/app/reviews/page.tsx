import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Guest feedback" };
export default function ReviewsPage() {
  return <InfoPage title={<>Travel is personal.<br /><em>Feedback is too.</em></>} intro="We do not publish invented testimonials, ratings or review counts. Verified customer feedback will appear here after travellers choose to share it." sections={[
    { title: "Reviews are being collected", body: "There are no published, verified customer reviews yet. If you have travelled with the team, contact us with your reference and we can explain how feedback is handled." },
    { title: "How reviews should work", body: "Reviews should come from genuine customers with a completed travel service, be moderated for privacy and abuse rather than sentiment, and be displayed with clear context." },
  ]} />;
}
