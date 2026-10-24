import type { Profile } from "@/lib/types";

/** Everything the card and portfolio show. Edit this file to update your card. */
export const kaushik: Profile = {
  slug: "kaushik",
  firstName: "Kaushik",
  lastName: "Burra",
  fullName: "Krishna Kaushik Burra",
  location: "Columbus, OH",
  title: "Biomedical Engineering Student",
  focus: "MedTech Software · AI and Business",
  bio: "I'm an aspiring biomedical engineer who specializes in MedTech software and building with AI. I want to build a career in product development, turning what clinicians and patients actually need into technology they can rely on.",
  tagline: "Let's build better healthcare together.",
  photo: "/photo.jpg",
  school: { name: "The Ohio State University", unit: "College of Engineering", year: "Sophomore" },
  degree: {
    label: "B.S. Engineering · The Ohio State University",
    major: "Biomedical Engineering",
    minor: "Minor in Business · College of Engineering",
    about: [
      "I study where engineering meets medicine, and I'm most interested in how software and AI can make healthcare tools faster, smarter, and easier for clinicians to use. My Business minor covers the other half of the problem: understanding why organizations adopt technology and how to turn a good idea into a product people actually use.",
      "Outside class I put that into practice through medical AI research, a pediatric medical device team, and AI products for real clients.",
    ],
  },
  facts: [
    { value: "3.8", label: "GPA" },
    { value: "34", label: "ACT" },
    { value: "Provost Scholar", label: "OSU Provost Scholarship for academic excellence and leadership", wide: true },
  ],
  contact: {
    phone: "+15135107139",
    email: "kaushikburra9@gmail.com",
    linkedin: "https://www.linkedin.com/in/kaushik-burra/",
    github: "https://github.com/kaushikburra9",
    githubUser: "kaushikburra9",
  },
  places: [
    {
      name: "Campus",
      sub: "2124 Fontana Labs, 140 W. 19th Ave, Columbus, OH 43210",
      href: "https://maps.google.com/?q=2124%20Fontana%20Labs%2C%20140%20W.%2019th%20Ave%2C%20Columbus%2C%20OH%2043210",
      icon: "pin",
    },
    {
      name: "OSU Biomedical Engineering",
      sub: "Undergraduate program",
      href: "https://bme.osu.edu/biomedical-engineering-undergraduate-program/advisingresources",
      icon: "globe",
    },
    { name: "GitHub", sub: "github.com/kaushikburra9", href: "https://github.com/kaushikburra9", icon: "code" },
  ],
  projects: [
    {
      id: "winsupply",
      feature: true,
      label: "Industry · AI/ML Software Engineering",
      title: "Agentic AI Sales Platform",
      where: "Winsupply · Capstone project, now part-time",
      org: { name: "Winsupply", place: "Dayton, Ohio" },
      summary: [
        "Winsupply supports hundreds of local distribution companies, and their customers and staff spend a lot of time digging through huge product catalogs to find a part and place an order. I built an AI sales agent that does that work in a conversation: ask for a product by chat, voice, or by uploading a PDF list, and the agent finds the right items, checks inventory, and places the order.",
        "The hard part was access. The catalog was confidential, with no simple way in for an AI, so I built a custom Model Context Protocol (MCP) server as a controlled gateway: the agent reaches only the product and inventory data it needs, using UCP and ACP as the standard for commerce data. RAG grounds every answer in Winsupply's own business data, so responses stay accurate.",
      ],
      metrics: [
        { value: "2nd", label: "Company capstone" },
        { value: "3", label: "Ways to order: chat, voice, PDF" },
      ],
      tags: ["MCP", "UCP / ACP", "RAG", "AI agents", "Python"],
      note: "Internal company project, so the code and demo aren't public.",
    },
    {
      id: "epicyouth",
      label: "Client project",
      title: "EpicYouth OS",
      where: "Freelance full-stack · EpicYouth Columbus",
      org: { name: "Epic", accent: "Youth", place: "Columbus" },
      summary: [
        "An operations platform for a nonprofit: grant tracking, a CRM, AI-powered autofill, and Google Sheets sync so staff kept the spreadsheets they already used.",
      ],
      metrics: [
        { value: "50%", label: "Less manual entry" },
        { value: "25", label: "Users" },
      ],
      tags: ["Next.js", "TypeScript", "Supabase", "AI APIs"],
    },
    {
      id: "brain-tumor",
      label: "Research",
      title: "Brain Tumor Classification",
      where: "AI Research Assistant · Dr. Simeng Zhu's lab",
      org: { name: "Wexner", place: "Medical Center" },
      summary: [
        "Developed and compared seven CNN models in PyTorch to classify brain tumors from MRI scans (BraTS dataset), training in parallel across nodes on the Ohio Supercomputer Center.",
      ],
      metrics: [
        { value: "87%", label: "Accuracy" },
        { value: "7", label: "Models" },
        { value: "25%", label: "Faster runs" },
      ],
      tags: ["PyTorch", "CNNs", "Medical imaging", "HPC"],
    },
    {
      id: "adapt",
      label: "Medical device · Team lead",
      title: "ADAPT",
      where: "Software Team Lead · Biomedical Engineering Society",
      image: {
        src: "/adapt.jpg",
        alt: "The ADAPT orthosis testing rig: an aluminum frame holding an ankle-foot orthosis, with an Arduino, motor driver, and breadboard wired to its sensors",
        position: "50% 45%",
      },
      summary: [
        "A device that tests ankle-foot orthosis materials through simulated step cycles, for clinicians at Nationwide Children's Hospital's Honda Gait Center. I lead its software: a Python GUI for live data and export, plus the link between hardware and software.",
      ],
      metrics: [{ value: "12", label: "Person team" }],
      tags: ["Python / Tkinter", "C++ / Arduino", "Bluetooth", "Sensors"],
    },
    {
      id: "mira",
      label: "Personal product",
      title: "MIRA AI",
      where: "AI wardrobe app",
      summary: [
        "Photograph your clothes and yourself, and MIRA mixes and matches them into outfits for any occasion, then saves your favorites. I built it for my sister, who was the first user.",
      ],
      tags: ["Full-stack", "Image AI"],
    },
    {
      id: "dance",
      status: "Current project · Prototype",
      label: "Current project",
      title: "Dance Analysis Engine",
      where: "For the OSU Origins Dance team",
      image: {
        src: "/dance.jpg",
        alt: "Dance Analysis app: upload a student clip and a reference clip, set the angle margin, and compare",
        position: "top center",
      },
      summary: [
        "As a dancer on Origins, I saw the same problem every practice. Cleaning a routine with 15 other people is hard: every move has to hit on the same count at the same angle, and small timing and spacing differences are almost impossible to catch by eye. Planning formations for that many dancers takes hours too.",
        "So I built a tool for it. It uses computer vision to track each dancer's movement: compare a dancer's clip against a reference to flag limbs that are clearly off and timing that drifts, or analyze the whole team at once to see who's out of sync. It also uses AI to generate formations.",
      ],
      tags: ["Python", "Computer vision", "AI formations"],
    },
    {
      id: "behavioral-os",
      status: "Current project",
      label: "Current project",
      title: "behavioral-os",
      where: "Web engine + native iOS app",
      summary: ["Learns your own usage patterns and steps in when it sees a known loop repeating."],
      tags: ["TypeScript", "iOS"],
      links: [{ label: "View on GitHub", href: "https://github.com/kaushikburra9/behavioral-os" }],
    },
  ],
  experience: {
    work: [
      {
        when: "May 2026 – Present",
        title: "AI/ML Software Engineering Intern → Part-time",
        org: "Winsupply · Dayton, OH",
        context:
          "Winsupply is one of Dayton's largest private companies. It supports a nationwide network of locally owned wholesale distribution companies that supply plumbing, HVAC, electrical, and industrial products.",
        bullets: [
          "Built an agentic AI sales platform so customers and employees can find products and place orders by chat, voice, or PDF upload.",
          "Created a custom MCP server for secure AI access to the confidential product catalog, with UCP/ACP and RAG.",
          "Placed 2nd in the company capstone and was asked to stay on part-time.",
        ],
      },
      {
        when: "Mar 2026 – Present",
        title: "Freelance Full-Stack Developer",
        org: "Nonprofits & small businesses",
        bullets: ["Built EpicYouth OS, cutting manual data entry 50% for 25 users.", "Built MIRA AI, Dance Tracker, and Pramajna."],
      },
      {
        when: "Sep 2025 – Sep 2026",
        title: "AI Research Assistant",
        org: "Dr. Simeng Zhu's lab · OSU Wexner Medical Center",
        bullets: ["CNN brain tumor classification on BraTS, 87% accuracy, on the Ohio Supercomputer Center."],
      },
      {
        when: "Aug 2024 – Mar 2025",
        title: "Biomedical Research Intern",
        org: "Dr. Anil Jegga's lab · Cincinnati Children's Hospital",
        bullets: ["Computational drug–gene interaction analysis for pancreatitis."],
      },
    ],
    leadership: [
      {
        when: "Sep 2025 – Present",
        title: "Software Team Lead, ADAPT",
        org: "Biomedical Engineering Society",
        bullets: [
          "Lead software development for an orthosis testing device used by clinicians at Nationwide Children's Hospital.",
          "Built the Python GUI for real-time data visualization and export.",
          "Own the hardware-to-software connection: load cell and IMU sensors, C++ Arduino firmware, a custom serial protocol, and Bluetooth connectivity.",
          "Coordinate with the electrical and mechanical sides of a 12-person team.",
        ],
      },
      {
        when: "Aug 2025 – Present",
        title: "Product Development Consultant",
        org: "Big Data & Analytics Association",
        bullets: [
          "Turn OSU Libraries stakeholders' problems into product requirements for a 10-person team.",
          "Run agile delivery with weekly deliverables, stand-ups, and demos.",
        ],
      },
      { when: "Member", title: "OSU Origins Dance Team", org: "Competitive dance", bullets: [], badge: "1st place at nationals" },
    ],
  },
  skills: [
    {
      name: "Technical",
      items: ["Python", "JavaScript", "TypeScript", "SQL", "HTML/CSS", "React", "Next.js", "Node.js", "FastAPI", "Supabase", "Git/GitHub", "REST APIs", "OpenAI/Anthropic APIs", "C++ / Arduino", "Bash scripting", "CAD", "Claude Code", "Cursor", "VS Code"],
    },
    { name: "AI & ML", items: ["PyTorch", "CNNs", "LLMs", "RAG", "AI agents", "MCP", "Agentic workflows", "Computer vision", "Medical imaging"] },
    { name: "Laboratory", items: ["Micropipetting", "Bacteria culture & streak plating", "Gram staining", "Gel electrophoresis", "PCR", "BLAST sequence analysis"] },
    { name: "Languages", items: ["English (fluent)", "Telugu (fluent)", "Hindi (conversational)"] },
  ],
  resume: { pdf: "/resume.pdf", image: "/resume-page.jpg" },
};

const profiles: Record<string, Profile> = { [kaushik.slug]: kaushik };

export function getProfile(slug: string): Profile | undefined {
  return profiles[slug];
}

export const ownerProfile = kaushik;
