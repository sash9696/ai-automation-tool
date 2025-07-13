export interface PostTemplate {
  id: string;
  name: string;
  style: string;
  category: string;
  description: string;
  content: string;
  hashtags: string[];
  tone: string;
  structure: string;
  viralElements: string[];
  targetAudience: string;
  engagementTriggers: string[];
}

export const POST_TEMPLATES: PostTemplate[] = [
  {
    id: "real-experience-story",
    name: "Real Experience Story",
    style: "personal-narrative",
    category: "storytelling",
    description: "Share a genuine experience with lessons learned",
    content: `Last week, I spent 3 hours debugging what turned out to be a simple CSS issue. 

I was building a responsive layout and couldn't figure out why my flexbox wasn't working as expected. After going through every possible solution I could think of, I finally discovered the problem: I had accidentally set display: none on the parent container.

The lesson? Always check the basics first. Sometimes the most obvious things are the hardest to spot when you're deep in the weeds.

What's the most embarrassing bug you've spent way too long debugging? 😅`,
    hashtags: ["#webdevelopment", "#css", "#debugging", "#learning"],
    tone: "storytelling",
    structure: "situation + struggle + discovery + lesson + question",
    viralElements: ["relatable struggle", "personal vulnerability", "practical lesson", "community question"],
    targetAudience: "developers who've been there",
    engagementTriggers: ["shared experience", "learning from mistakes", "community bonding"]
  },
  {
    id: "mentor-advice",
    name: "Mentor Advice",
    style: "guidance-sharing",
    category: "mentorship",
    description: "Share wisdom gained from experience",
    content: `I've been mentoring junior developers for 5 years now, and there's one piece of advice I find myself giving over and over:

Don't try to learn everything at once.

I see so many new developers overwhelmed by the sheer amount of technologies out there. They want to learn React, Node.js, Python, AWS, Docker, Kubernetes - all at the same time.

Here's what I tell them: Pick one thing. Master it. Then move to the next.

The developers I've seen succeed fastest are the ones who go deep rather than wide. They become experts in one area before branching out.

What's the one technology you're focusing on mastering right now?`,
    hashtags: ["#mentorship", "#careeradvice", "#learning", "#development"],
    tone: "mentor-like",
    structure: "experience + observation + advice + reasoning + question",
    viralElements: ["mentorship authority", "practical advice", "contrarian thinking", "personal experience"],
    targetAudience: "junior developers and career changers",
    engagementTriggers: ["career guidance", "learning strategy", "mentorship"]
  },
  {
    id: "colleague-insight",
    name: "Colleague Insight",
    style: "peer-sharing",
    category: "collaboration",
    description: "Share insights from working with others",
    content: `Had an interesting conversation with a colleague today about code reviews.

She mentioned that she always starts her reviews by looking for the positive aspects first - what the developer did well, what patterns they used effectively, what creative solutions they came up with.

Then she moves to suggestions for improvement.

I realized I've been doing the opposite - jumping straight to what could be better. Her approach is so much more constructive and encouraging.

It's amazing how small changes in perspective can make such a big difference in team dynamics.

How do you approach code reviews? Any tips for making them more collaborative?`,
    hashtags: ["#codereviews", "#teamwork", "#collaboration", "#softskills"],
    tone: "colleague-sharing",
    structure: "conversation + insight + reflection + realization + question",
    viralElements: ["peer learning", "soft skills", "team dynamics", "personal growth"],
    targetAudience: "developers working in teams",
    engagementTriggers: ["team collaboration", "professional development", "soft skills"]
  },
  {
    id: "thoughtful-reflection",
    name: "Thoughtful Reflection",
    style: "deep-thinking",
    category: "philosophy",
    description: "Share deep thoughts about the industry",
    content: `Been thinking a lot about the "senior developer" title lately.

What does it actually mean? Is it about years of experience? Technical skills? Leadership abilities?

I've met developers with 10+ years of experience who still struggle with basic debugging, and others with 2 years who can architect entire systems.

Maybe being "senior" isn't about time served, but about mindset. The ability to think beyond the immediate problem, to consider the broader impact of your decisions, to mentor others.

The developers I consider truly senior are the ones who make everyone around them better.

What does "senior developer" mean to you?`,
    hashtags: ["#careerdevelopment", "#leadership", "#mentorship", "#reflection"],
    tone: "thoughtful",
    structure: "contemplation + questions + observations + insight + question",
    viralElements: ["philosophical thinking", "industry reflection", "contrarian perspective", "deep questions"],
    targetAudience: "developers thinking about career growth",
    engagementTriggers: ["career philosophy", "industry discussion", "personal reflection"]
  },
  {
    id: "enthusiastic-discovery",
    name: "Enthusiastic Discovery",
    style: "excited-sharing",
    category: "learning",
    description: "Share excitement about new discoveries",
    content: `Just discovered something that blew my mind! 🤯

I've been using JavaScript for years, but I never really understood how closures work under the hood. Today I finally dug deep into the concept and... wow.

The way JavaScript creates a "backpack" of variables that persist even after the outer function finishes executing is absolutely brilliant. It's like having a little memory box that travels with your inner function.

I built a simple example to test it out, and seeing it work in practice was like unlocking a superpower.

Sometimes the most satisfying moments in coding are when you finally understand something that's been mysterious for years.

What's a concept that finally "clicked" for you recently?`,
    hashtags: ["#javascript", "#closures", "#learning", "#excitement"],
    tone: "enthusiastic",
    structure: "discovery + explanation + metaphor + experience + question",
    viralElements: ["genuine excitement", "technical discovery", "personal breakthrough", "learning moment"],
    targetAudience: "developers passionate about learning",
    engagementTriggers: ["learning excitement", "technical discovery", "personal growth"]
  },
  {
    id: "humble-expertise",
    name: "Humble Expertise",
    style: "modest-sharing",
    category: "knowledge",
    description: "Share knowledge without being preachy",
    content: `I've been working with React for about 4 years now, and I'm still learning new things every day.

Recently, I discovered that you can use the useCallback hook to optimize performance, but only in very specific situations. Most of the time, it's actually unnecessary and can even hurt performance.

I used to add useCallback everywhere thinking it would make my app faster. Turns out, premature optimization is still a thing, even in React.

The key is understanding when it actually helps - usually when you're passing callbacks to child components that are expensive to re-render.

It's humbling to realize how much I still don't know, even about tools I use daily.

Anyone else have similar "aha" moments with React optimization?`,
    hashtags: ["#react", "#performance", "#optimization", "#learning"],
    tone: "humble-expert",
    structure: "experience + discovery + mistake + learning + humility + question",
    viralElements: ["expertise with humility", "learning from mistakes", "practical knowledge", "vulnerability"],
    targetAudience: "React developers",
    engagementTriggers: ["technical learning", "performance optimization", "humble expertise"]
  },
  {
    id: "community-building",
    name: "Community Building",
    style: "connection-focused",
    category: "community",
    description: "Focus on building connections and community",
    content: `One of the best decisions I made in my career was joining a local developer meetup.

At first, I was intimidated. Everyone seemed so much more experienced than me. But I quickly realized that the most senior developers were often the most welcoming and eager to help.

Through that community, I've found mentors, collaborators, and friends. I've learned about job opportunities, new technologies, and different approaches to problem-solving.

The tech industry can feel isolating, especially when you're working remotely or at a small company. But there are amazing communities out there waiting to welcome you.

If you're feeling isolated in your tech journey, I'd encourage you to find your local developer community. You might be surprised by how welcoming they are.

What communities have been most valuable in your career?`,
    hashtags: ["#community", "#networking", "#mentorship", "#career"],
    tone: "community-focused",
    structure: "decision + experience + benefits + broader point + encouragement + question",
    viralElements: ["community value", "personal growth", "encouragement", "connection"],
    targetAudience: "developers looking for community",
    engagementTriggers: ["community building", "networking", "career support"]
  }
];

export const getTemplateById = (id: string): PostTemplate | undefined => {
  return POST_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): PostTemplate[] => {
  return POST_TEMPLATES.filter(template => template.category === category);
};

export const getTemplateCategories = (): string[] => {
  return [...new Set(POST_TEMPLATES.map(template => template.category))];
};

export const getTopTemplates = (limit: number = 5): PostTemplate[] => {
  // Return the most viral templates based on engagement triggers and viral elements
  const topTemplates = POST_TEMPLATES
    .sort((a, b) => {
      // Sort by number of viral elements and engagement triggers
      const aScore = a.viralElements.length + a.engagementTriggers.length;
      const bScore = b.viralElements.length + b.engagementTriggers.length;
      return bScore - aScore; // Descending order
    })
    .slice(0, limit);
  
  return topTemplates;
}; 