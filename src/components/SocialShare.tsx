import { Share2, Facebook, Twitter, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export function SocialShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-green-500 hover:bg-green-600 text-white',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-black hover:bg-zinc-800 text-white',
    },
  ];

  return (
    <div className="flex flex-col gap-3 mt-2 w-full">
      <div className="flex justify-between items-center px-1 mb-1">
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Share this poll</h3>
      </div>
      <div className="flex gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center py-3 rounded-xl transition-colors ${link.color}`}
            title={`Share on ${link.name}`}
          >
            <link.icon className="w-5 h-5" />
          </a>
        ))}
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 transition-colors"
          title="Copy Link"
        >
          <LinkIcon className="w-5 h-5" />
        </button>
      </div>
      {copied && (
        <p className="text-xs text-center text-green-600 font-medium">Link copied to clipboard!</p>
      )}
    </div>
  );
}
