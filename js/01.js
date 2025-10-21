// 🎯 마우스 커서 애니메이션 & SVG 모핑 효과
document.addEventListener("DOMContentLoaded", () => {
  // === 상수 및 설정 ===
  const CONFIG = {
    GHOST_DISTANCE: 50,
    GHOST_DURATION: 0.8,
    MOVEMENT_THRESHOLD: 0.05,
    MORPH_DURATION: 0.3,
    DISTANCE_MULTIPLIER: {
      RIGHT: 1.5,
      LEFT: 1.2,
      DEFAULT: 1,
    },
  };

  // === DOM 요소 ===
  const elements = {
    circle: document.querySelector(".black-circle"),
    ghost: document.querySelector(".ghost"),
    hippo: document.querySelector("#hippo"),
    ghostPath: null,
    hippoPath: null,
  };

  // === 상태 관리 ===
  const state = {
    lastMouseX: 0,
    lastMouseY: 0,
    isHovering: false,
  };

  // === 초기화 ===
  const init = () => {
    elements.ghostPath = elements.ghost.querySelector("path");
    elements.hippoPath = elements.hippo.querySelector("path");

    state.originalGhostPath = elements.ghostPath.getAttribute("d");
    state.targetPath = elements.hippoPath.getAttribute("d");

    gsap.set([elements.circle, elements.ghost], { x: 0, y: 0 });
    document.body.style.cursor = "none";
  };

  // === 거리 계산 함수 ===
  const calculateDistance = (dirX) => {
    if (dirX > 0.5)
      return CONFIG.GHOST_DISTANCE * CONFIG.DISTANCE_MULTIPLIER.RIGHT;
    if (dirX < -0.5)
      return CONFIG.GHOST_DISTANCE * CONFIG.DISTANCE_MULTIPLIER.LEFT;
    return CONFIG.GHOST_DISTANCE * CONFIG.DISTANCE_MULTIPLIER.DEFAULT;
  };

  // === Ghost 위치 업데이트 ===
  const updateGhostPosition = (mouseX, mouseY, dx, dy) => {
    const movementMagnitude = Math.hypot(dx, dy);
    const dirX = dx / movementMagnitude;
    const dirY = dy / movementMagnitude;
    const adjustedDistance = calculateDistance(dirX);

    gsap.to(elements.ghost, {
      x: mouseX - dirX * adjustedDistance,
      y: mouseY - dirY * adjustedDistance,
      duration: CONFIG.GHOST_DURATION,
      ease: "back.out(1.2)",
    });
  };

  // === 눈 생성 함수 ===
  const createEye = () => {
    const eye = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    eye.setAttribute("cx", "100");
    eye.setAttribute("cy", "50");
    eye.setAttribute("r", "0");
    eye.setAttribute("fill", "#000");
    elements.ghost.appendChild(eye);

    gsap.to(eye, {
      attr: { r: 15 },
      duration: CONFIG.MORPH_DURATION,
      ease: "power2.out",
    });
  };

  // === 눈 제거 함수 ===
  const removeEye = () => {
    const eye = elements.ghost.querySelector("circle");
    if (!eye) return;

    gsap.to(eye, {
      attr: { r: 0 },
      duration: CONFIG.MORPH_DURATION,
      ease: "power2.out",
      onComplete: () => eye.remove(),
    });
  };

  // === 호버 상태 전환 ===
  const toggleHoverState = (isHovering) => {
    if (isHovering) {
      // Ghost → Hippo 변환
      gsap.to(elements.ghostPath, {
        attr: { d: state.targetPath },
        duration: CONFIG.MORPH_DURATION,
        ease: "power2.out",
      });

      if (!elements.ghost.querySelector("circle")) {
        createEye();
      }

      elements.ghost.classList.add("hovering");
    } else {
      // Hippo → Ghost 변환
      gsap.to(elements.ghostPath, {
        attr: { d: state.originalGhostPath },
        duration: CONFIG.MORPH_DURATION,
        ease: "power2.out",
      });

      removeEye();
      elements.ghost.classList.remove("hovering");
    }
  };

  // === 마우스 위치 업데이트 ===
  const updatePositions = (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // 검은 원 위치 업데이트
    elements.circle.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

    // 마우스 이동 방향 계산
    const dx = mouseX - state.lastMouseX;
    const dy = mouseY - state.lastMouseY;

    // Ghost 위치 업데이트 (임계값 이상 움직임일 때만)
    if (
      Math.abs(dx) > CONFIG.MOVEMENT_THRESHOLD ||
      Math.abs(dy) > CONFIG.MOVEMENT_THRESHOLD
    ) {
      updateGhostPosition(mouseX, mouseY, dx, dy);
    }

    // 호버 상태 감지 및 처리
    const hovering = !!e.target.closest(
      "a, button, input, textarea, select, [role='button']"
    );

    if (hovering !== state.isHovering) {
      state.isHovering = hovering;
      toggleHoverState(hovering);
    }

    // 상태 업데이트
    state.lastMouseX = mouseX;
    state.lastMouseY = mouseY;
    document.body.classList.toggle("hovering", hovering);
  };

  // === 스크롤 시 투명도 조정 ===
  const updateOpacity = () => {
    const scrollRatio = window.scrollY / window.innerHeight;
    const opacity = Math.max(0.3, 0.7 - scrollRatio * 0.4);

    gsap.to(elements.circle, {
      opacity,
      duration: 0.2,
      ease: "power1.out",
    });
  };

  // === 이벤트 리스너 등록 ===
  const bindEvents = () => {
    document.addEventListener("mousemove", updatePositions);
    window.addEventListener("scroll", updateOpacity);
  };

  // === 실행 ===
  init();
  bindEvents();
});
