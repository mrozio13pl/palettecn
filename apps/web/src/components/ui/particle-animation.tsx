import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export const ParticleAnimation = ({
    className,
    particleCount = 500,
    colors = ['#00b8a9', '#f8f3d4', '#f6416c', '#ffde7d'],
    animationDuration = [1, 2],
    perspective = '10vmin',
    particleWidth = '30%',
    particleHeight = '1px',
}: {
    className?: string;
    particleCount?: number;
    colors?: Array<string>;
    animationDuration?: [number, number];
    perspective?: string;
    particleWidth?: string;
    particleHeight?: string;
}) => {
    const [particles, setParticles] = useState<
        Array<{
            id: number;
            duration: number;
            delay: number;
            rotateX: number;
            rotateY: number;
            rotateZ: number;
            gradientStops: number;
            color: string;
            transparentStop: number;
        }>
    >([]);

    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

    const randomRotation = () => random(-180, 180);

    // Create particles data
    useEffect(() => {
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            duration: random(animationDuration[0], animationDuration[1]),
            delay: -random(0.1, 2),
            rotateX: randomRotation(),
            rotateY: randomRotation(),
            rotateZ: randomRotation(),
            gradientStops: Math.floor(random(2, 5)),
            color: randomColor(),
            transparentStop: random(50, 100),
        }));
        setParticles(newParticles);
    }, [particleCount, animationDuration, colors]);

    return (
        <div
            className="relative size-full flex items-center justify-center"
            style={{
                perspective: perspective,
            }}
        >
            <div className={cn('relative flex items-end justify-center', className)}>
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute"
                        style={
                            {
                                width: particleWidth,
                                height: particleHeight,
                                willChange: 'transform, opacity',
                                transformStyle: 'preserve-3d',
                                background: `linear-gradient(to left, ${particle.color}, transparent ${particle.transparentStop}%)`,
                                animation: `move-${particle.id} ${particle.duration}s linear infinite`,
                                animationDelay: `${particle.delay}s`,
                                transformOrigin: '0 center',
                                '--rotateX': `${particle.rotateX}deg`,
                                '--rotateY': `${particle.rotateY}deg`,
                                '--rotateZ': `${particle.rotateZ}deg`,
                            } as CSSProperties
                        }
                    />
                ))}
            </div>

            <style>
                {`
        ${particles
            .map(
                (particle) => `
          @keyframes move-${particle.id} {
            0% {
              transform: translateX(50%) rotateX(${particle.rotateX}deg) rotateY(${particle.rotateY}deg) rotateZ(${particle.rotateZ}deg) scale(2);
              opacity: 0;
            }
            20% {
              opacity: 1;
            }
            100% {
              transform: translateX(50%) rotateX(${particle.rotateX}deg) rotateY(${particle.rotateY}deg) rotateZ(${particle.rotateZ}deg) scale(0);
              opacity: 1;
            }
          }
        `,
            )
            .join('\n')}
      `}
            </style>
        </div>
    );
};
