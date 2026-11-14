export type Curriculum = { id: string; name: string; nameBn: string; semesters: number };

export const CURRICULA: Curriculum[] = [
  { id: "diploma_in_engineering", name: "Diploma in Engineering", nameBn: "ডিপ্লোমা ইন ইঞ্জিনিয়ারিং", semesters: 8 },
  { id: "ssc_vocational", name: "SSC (Vocational)", nameBn: "এসএসসি (ভোকেশনাল)", semesters: 2 },
  { id: "dakhil_vocational", name: "Dakhil (Vocational)", nameBn: "দাখিল (ভোকেশনাল)", semesters: 2 },
  { id: "diploma_in_engineering_army", name: "Diploma in Engineering (Army)", nameBn: "ডিপ্লোমা ইন ইঞ্জিনিয়ারিং (আর্মি)", semesters: 8 },
  { id: "diploma_in_engineering_naval", name: "Diploma in Engineering (Naval)", nameBn: "ডিপ্লোমা ইন ইঞ্জিনিয়ারিং (নেভাল)", semesters: 8 },
  { id: "diploma_in_textile_engineering", name: "Diploma in Textile Engineering", nameBn: "ডিপ্লোমা ইন টেক্সটাইল ইঞ্জিনিয়ারিং", semesters: 8 },
  { id: "diploma_in_tourism_and_hospitality", name: "Diploma in Tourism And Hospitality", nameBn: "ডিপ্লোমা ইন ট্যুরিজম অ্যান্ড হসপিটালিটি", semesters: 8 },
  { id: "diploma_in_agriculture", name: "Diploma in Agriculture", nameBn: "ডিপ্লোমা ইন এগ্রিকালচার", semesters: 8 },
  { id: "diploma_in_fisheries", name: "Diploma in Fisheries", nameBn: "ডিপ্লোমা ইন ফিশারিজ", semesters: 8 },
  { id: "diploma_in_forestry", name: "Diploma in Forestry", nameBn: "ডিপ্লোমা ইন ফরেস্ট্রি", semesters: 8 },
  { id: "diploma_in_livestock", name: "Diploma in Livestock", nameBn: "ডিপ্লোমা ইন লাইভস্টক", semesters: 8 },
  { id: "certificate_in_marine_trade", name: "Certificate In Marine Trade", nameBn: "সার্টিফিকেট ইন মেরিন ট্রেড", semesters: 4 },
  { id: "diploma_in_medical_technology", name: "Diploma in Medical Technology", nameBn: "ডিপ্লোমা ইন মেডিকেল টেকনোলজি", semesters: 6 },
  { id: "hsc_bmt", name: "HSC (BMT)", nameBn: "এইচএসসি (বিএমটি)", semesters: 2 },
  { id: "hsc_vocational", name: "HSC (Vocational)", nameBn: "এইচএসসি (ভোকেশনাল)", semesters: 2 },
  { id: "advanced_certificate_course", name: "Advanced Certificate Course", nameBn: "অ্যাডভান্সড সার্টিফিকেট কোর্স", semesters: 2 },
  { id: "national_skill_standard_basic_certificate_course", name: "National Skill Standard Basic Certificate Course", nameBn: "ন্যাশনাল স্কিল স্ট্যান্ডার্ড বেসিক সার্টিফিকেট কোর্স", semesters: 1 },
  { id: "one_year_certificate_course", name: "One Year Certificate Course", nameBn: "এক বছর মেয়াদী সার্টিফিকেট কোর্স", semesters: 1 },
  { id: "diploma_in_commerce", name: "Diploma in Commerce", nameBn: "ডিপ্লোমা ইন কমার্স", semesters: 2 },
  { id: "certificate_in_medical_ultrasound", name: "Certificate In Medical Ultrasound", nameBn: "সার্টিফিকেট ইন মেডিকেল আলট্রাসাউন্ড", semesters: 1 },
];

export const CURRICULUM_MAP = new Map(CURRICULA.map((c) => [c.id, c]));

export function curriculumName(id: string) {
  return CURRICULUM_MAP.get(id)?.name ?? id;
}
