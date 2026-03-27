"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  id: number;
  title: string;
  icon?: React.ReactNode;
}

interface StepperModernProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepperModern({ steps, currentStep, onStepClick }: StepperModernProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = onStepClick && (isCompleted || isActive);

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative">
              <motion.button
                onClick={() => isClickable && onStepClick(index)}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted && "bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent",
                  isActive && "bg-gradient-to-r from-violet-500 to-purple-500 border-transparent shadow-lg shadow-violet-500/30",
                  !isCompleted && !isActive && "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600",
                  isClickable && "cursor-pointer hover:scale-110"
                )}
                whileHover={isClickable ? { scale: 1.1 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className={cn(
                    "font-semibold",
                    isActive ? "text-white" : "text-gray-500"
                  )}>
                    {index + 1}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>

              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-20 text-center">
                <p className={cn(
                  "text-xs font-medium truncate",
                  isActive ? "text-violet-600 dark:text-violet-400" :
                    isCompleted ? "text-emerald-600 dark:text-emerald-400" :
                      "text-gray-500"
                )}>
                  {step.title}
                </p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 mt-[-20px]">
                <div className="h-0.5 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500"
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}