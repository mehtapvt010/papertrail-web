'use client';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';

const slides = [
  {
    title: 'Welcome to PaperTrail AI',
    body: 'Your zero-cost, privacy-first vault. All files stay encrypted in the browser.',
    img: '/onboard/slide1.png',
  },
  {
    title: 'Fast OCR & Search',
    body: 'We run Tesseract.js + bge-base embeddings locally – no paid APIs.',
    img: '/onboard/slide2.png',
  },
  {
    title: 'Expiry Radar',
    body: 'Daily Cloudflare Worker pings you when documents near expiry.',
    img: '/onboard/slide3.png',
  },
];

export function OnboardingDialog() {
  const { open, complete, setOpen } = useOnboarding();
  const [idx, setIdx] = useState(0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>{slides[idx].title}</DialogTitle>
        <DialogDescription>{slides[idx].body}</DialogDescription>

        <div className="flex justify-center py-4">
          <Image
            src={slides[idx].img}
            alt={slides[idx].title}
            width={220}
            height={160}
            priority
          />
        </div>

        <div className="mt-6 flex justify-between w-full">
          <Button
            variant="outline"
            disabled={idx === 0}
            onClick={() => setIdx(i => i - 1)}
          >
            Back
          </Button>
          {idx < slides.length - 1 ? (
            <Button onClick={() => setIdx(i => i + 1)}>Next</Button>
          ) : (
            <Button onClick={complete}>Get started</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
