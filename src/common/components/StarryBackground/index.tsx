import { useEffect, useRef } from "react"

interface StarryBackgroundProps {
  /**
   * 星星数量
   */
  starsCount?: number
  
  /**
   * 背景透明度，0-1之间，默认0.3
   */
  backgroundOpacity?: number
  
  /**
   * 背景颜色渐变，默认深空色调
   */
  backgroundGradient?: string
  
  /**
   * 是否显示背景
   */
  showBackground?: boolean
}

const StarryBackground: React.FC<StarryBackgroundProps> = ({
  starsCount = 50,
  backgroundOpacity = 0.3,
  backgroundGradient = "linear-gradient(to bottom, #0f0f23 0%, #1c1c3d 100%)",
  showBackground = true
}) => {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (starsRef.current) {
      starsRef.current.innerHTML = '';
      
      for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 2 + 1;
        
        star.style.position = 'absolute';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.borderRadius = '50%';
        star.style.backgroundColor = 'white';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = '0';
        star.style.boxShadow = '0 0 3px 1px rgba(255,255,255,0.5)';
        
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 5;
        star.style.animation = `star-twinkle ${duration}s ease-in-out ${delay}s infinite`;
        
        starsRef.current.appendChild(star);
      }
    }
  }, [starsCount]);

  return (
    <>
      {showBackground && (
        <div 
          className="starry-bg" 
          style={{ 
            opacity: backgroundOpacity,
            background: backgroundGradient
          }}
        />
      )}
      <div 
        ref={starsRef} 
        className="absolute inset-0 z-0 pointer-events-none"
        data-testid="stars-container"
      />
    </>
  );
};

export default StarryBackground; 
