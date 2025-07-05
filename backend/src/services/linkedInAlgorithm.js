// LinkedIn Algorithm Service
// Based on the working linkedin-post-generator app
// Higher score = higher reach potential

import Sentiment from 'sentiment';
import LanguageDetect from 'languagedetect';

export function rankLinkedInPost(post, hasMedia = false) {
  const parsedPost = post.toLowerCase();
  
  // Default score
  if (parsedPost.length < 2) {
    return {
      score: 0,
      validations: [],
    };
  }

  const sentimentAnalyzer = new Sentiment();
  const sentimentResponse = sentimentAnalyzer.analyze(post);
  
  const postData = {
    post: parsedPost,
    originalPost: post,
    sentiment: sentimentResponse,
    postMedia: hasMedia,
  };

  const rules = [
    emojis(postData),
    sentiment({ sentiment: sentimentResponse }),
    lineBreaks(postData),
    questions(postData),
    multipleHashtags(postData),
    imageVideoBoost(postData),
    postHasUrl(postData),
    lineLength(postData),
  ];

  const scores = rules.map((item) => item.score);
  const validations = rules
    .map((item) => {
      if (item.message) {
        const type = item.type
          ? item.type
          : item.score >= 1
          ? "positive"
          : "negative";
        const operator = type === "positive" ? "+" : "-";
        return {
          message: `${item.message} (${operator}${Math.abs(item.score)})`,
          type,
        };
      }
    })
    .filter(Boolean);

  const sum = scores.reduce((partialSum, a) => partialSum * a, 1);
  
  return {
    score: sum,
    validations,
  };
}

function multipleHashtags({ post }) {
  const regex = /#[\w-]+/g;
  const hashtags = post.match(regex);
  const lowerCasePost = post.toLowerCase();

  if (hashtags && hashtags.length > 3) {
    return {
      score: 0.5,
      message: `Too many hashtags.`,
    };
  }
  
  if (hashtags && hashtags.length <= 3) {
    if (
      lowerCasePost.includes("#follow") ||
      lowerCasePost.includes("#comment") ||
      lowerCasePost.includes("#like")
    ) {
      return {
        score: 0.5,
        message: `Avoid using hashtags like "follow," "comment," or "like".`,
      };
    }
    return {
      score: 1,
      message: `Combine general and specific hashtags.`,
    };
  }

  return {
    score: 1.0,
  };
}

function imageVideoBoost({ postMedia }) {
  const has_media = postMedia;
  if (has_media) {
    return {
      score: 2.0,
      message: `Contains image or video.`,
    };
  }
  return {
    score: 1.0,
  };
}

function postHasUrl({ post }) {
  const regex =
    /https?:\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/g;
  const urls = post.match(regex);
  if (urls && urls.length > 0) {
    return {
      score: 0.5,
      message: `Remove the link from post and add in comments.`,
    };
  }
  return {
    score: 1.0,
  };
}

function emojis({ post }) {
  const regex = new RegExp("[\uD800-\uDBFF][\uDC00-\uDFFF]", "g");
  const emojis = post.match(regex) || [];
  const totalMatches = emojis.length;
  if (totalMatches > 0) {
    return {
      score: 1.5,
      message: `Included ${totalMatches} emojis in the post.`,
    };
  }
  return {
    score: 1,
    message: "No emojis found in the post.",
    type: "negative",
  };
}

function sentiment({ sentiment }) {
  if (sentiment.comparative >= 0.5) {
    if (sentiment.comparative > 1.5) {
      return {
        score: 1.5,
        message: `Exceptionally positive.`,
      };
    } else {
      return {
        score: 1.1,
        message: `Positive sentiment.`,
      };
    }
  } else if (sentiment.comparative <= -0.5) {
    if (sentiment.comparative < -1.5) {
      return {
        score: 0.5,
        message: `Exceptionally negative.`,
      };
    } else {
      return {
        score: 0.9,
        message: `Negative sentiment.`,
      };
    }
  }
  return {
    score: 1.0,
    message: `Neutral sentiment.`,
  };
}

function lineBreaks({ post }) {
  const lines = post.split('\n').filter(line => line.trim().length > 0);
  if (lines.length >= 3) {
    return {
      score: 1.2,
      message: `Good use of line breaks.`,
    };
  }
  return {
    score: 1.0,
  };
}

function lineLength({ post }) {
  const lines = post.split('\n');
  const longLines = lines.filter(line => line.length > 200);
  
  if (longLines.length > 0) {
    return {
      score: 0.8,
      message: `Some lines are too long (max 200 characters recommended).`,
    };
  }
  return {
    score: 1.0,
  };
}

function questions({ post }) {
  const questionRegex = /\?/g;
  const questions = post.match(questionRegex);
  
  if (questions && questions.length > 0) {
    return {
      score: 1.3,
      message: `Includes questions to engage audience.`,
    };
  }
  return {
    score: 1.0,
  };
}

// LinkedIn post optimization prompts based on the working app
export const getLinkedInOptimizationPrompt = (originalPost, vibe = 'Story') => {
  const basePrompt = `You are a LinkedinGPT, a large language model that generates viral posts for Linkedin. You are given a prompt of a post and must generate a post that is more likely to be liked and reposted than the original post.

The Linkedin algorithm contains boosts and demotions based on what you are writing. Positive boosts are:
- in each post add emoji
- 200 characters in sentence maximum
- Start each sentence from new line and add numbers in first 2 lines
- add 3 hashtags which 2 are generic and one very specific (at the end) Tags relate to post theme
- add a question at the end of the post to start a discussion. Before the hashtags
- first two lines should be catchy
- Don't add links - links are not good.
- If post copied in the field contain some numbers keep them the same.

Original post: ${originalPost}

Generated post length must be more than 800-1200 characters
Between each line must be a space
Keep all mentions of people in there
Start the first line from something like: I did something, In year, I do, Tired of, Sometimes it is just, A path toward, Because this is not, I've been struggling (change the beginning depends on the context)
Add emoji if it fits`;

  switch (vibe) {
    case 'Story':
      return `${basePrompt}
It should be a story`;
      
    case 'Crisp':
      return `Generate post using this prompt, based on ${originalPost}. You are a LinkedinGPT, a large language model that generates viral posts for Linkedin. You are given a prompt of a post and must generate a post that is more likely to be liked and reposted than the original post.
The Linkedin algorithm contains boosts and demotions based on what you are writing. If person select this ${vibe}, make sure the generated ${originalPost} must follow these conditions and be short, crisp and inspiring:
- Post length must be no more than 500 characters. 
- Each sentence length is less than 50 characters. 
- First sentences must start with something like that: I've spent 5 months, 10 step plan, I made 10000 In, Last January, this January, I was on .. , I created 1000 of, how to get 1000 followers, how to do 1000 of, 10 lessons took me, 15 reasons, 5 days ago, 3 shocking steps, my strategy for 2023, over the past 10 years. (change numbers, generate always new numbers, generate always new beginning). Next sentences should not include numbers and these formulations.  
- If post copied in the field contain some numbers keep them the same.
- Next sentences should be generated, should not include numbers.
Each sentence from new line 
Add space between each abstract.
Show only generated post`;
      
    case 'List':
      return `Generate a post that is likely to be liked and reposted on LinkedIn, based on ${originalPost}. Your post should follow these conditions:
Post length must be no more than one hundred characters.
Each sentence length is no more than two words.
Post is a list of things.
First sentence must start with one of the following: There are 2 types of, 1 big mistake to avoid, When you..., avoid..., 5 quick tips..., Most companies..., If you don't plan to... (replace the ellipsis with a number).
If the copied post contains numbers, keep them the same.
The next sentences should be generated and should not include numbers.`;
      
    case 'Unpopular opinion':
      return `Generate post using this prompt, based on ${originalPost}. You are a LinkedinGPT, a large language model that generates viral posts for Linkedin. You are given a prompt of a post and must generate a post that is more likely to be liked and reposted than the original post.
The Linkedin algorithm contains boosts and demotions based on what you are writing. If person select this ${vibe}, make sure the generated post must follow these conditions and create an unpopular opinion about the topic:
- Post length must be less than 200 characters. 
- Post must contain no more than 3 sentences 
- First sentence must start with: Unpopular opinion: 
Add space between each abstract.`;
      
    case 'Case Study':
      return `Generate post using this prompt, based on ${originalPost}. You are a LinkedinGPT, a large language model that generates viral posts for Linkedin. You are given a prompt of a post and must generate a post that is more likely to be liked and reposted than the original post.
The Linkedin algorithm contains boosts and demotions based on what you are writing. If person select this ${vibe}, make sure the generated post must follow these conditions and be fulfilling and rigorous and relate to post typed:
- Post must relate to what initially is inserted  
- Post length must be no more than 1000 characters. 
- Each sentence length is less than 200 characters. 
- First sentence of the must start with something like that, or similar text to one: Pro-tip, These simple experiments, Here is one of my biggest learnings from this year, Inside, Being ... does not mean, Earlier this year, This might be the hottest (use similar words) 
- If post copied in the field contain some numbers keep them the same.
- Next sentences should be generated, and contain list, rigorous list, each list point start from emoji
Provide the idea for graphics, image, scheme which will fuel these case study post at the end in the brackets
Add space between each abstract.`;
      
    default:
      return basePrompt;
  }
}; 