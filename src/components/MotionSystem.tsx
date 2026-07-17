import type { PointerEvent, ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'

interface PageTransitionProps {
  children: ReactNode
  viewKey: string
}

export function PageTransition({ children, viewKey }: PageTransitionProps) {
  return (
    <motion.div
      key={viewKey}
      className="page-transition"
      initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -5, filter: 'blur(2px)' }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

export function Reveal({ children, className, delay = 0, y = 18 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

interface KineticArtifactProps {
  total: number
  score: number
}

export function KineticArtifact({ total, score }: KineticArtifactProps) {
  const reducedMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 22, mass: 0.7 })
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 22, mass: 0.7 })
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12])
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [11, -11])
  const accentX = useTransform(smoothX, [-0.5, 0.5], [-10, 10])
  const accentY = useTransform(smoothY, [-0.5, 0.5], [-8, 8])

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5)
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  const resetPointer = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <div className="kinetic-artifact" onPointerMove={handlePointerMove} onPointerLeave={resetPointer} aria-hidden="true">
      <motion.div
        className="artifact-stage"
        style={{ rotateX: reducedMotion ? 0 : rotateX, rotateY: reducedMotion ? 0 : rotateY }}
      >
        <motion.div
          className="artifact-halo halo-a"
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="artifact-halo halo-b"
          animate={reducedMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        <div className="artifact-orb">
          <span className="orb-glow" />
          <span className="orb-grid" />
          <motion.span
            className="orb-core"
            animate={reducedMotion ? undefined : { scale: [1, 1.045, 1], y: [0, -3, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <strong>{total}</strong>
            <small>في رصيدك</small>
          </motion.span>
        </div>
        <motion.div
          className="artifact-chip chip-score"
          style={{ x: reducedMotion ? 0 : accentX, y: reducedMotion ? 0 : accentY }}
          animate={reducedMotion ? undefined : { translateY: [0, -5, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span>جاهزية الرصيد</span>
          <strong>{score}%</strong>
        </motion.div>
        <motion.div
          className="artifact-chip chip-proof"
          animate={reducedMotion ? undefined : { translateY: [0, 5, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <i />
          <span>موثّق محليًا</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
