# 🎬 Sahayak Health — 90-Second Demo Script & Stage Directions

This script provides step-by-step stage directions, spoken lines, and actions for demonstrating **Sahayak Health** in 90 seconds.

---

## ⏱️ Timeline & Stage Directions

### 🟢 [0:00 - 0:15] Introduction & Landing Page
- **Action**: Open `http://localhost:3000` on your browser. Position cursor over the **Start Chat** button.
- **Spoken Lines**:
  > *"Millions of non-English speakers lack immediate access to understandable health guidance during symptom onset. Sahayak Health is a free, multilingual AI health companion built to bridge this gap in English, Hindi, and Gujarati."*
- **Action**: Click **Start Chat** to transition to `/chat`.

---

### 🔵 [0:15 - 0:35] Symptom Chip & AI Triage
- **Action**: Point out the quick-select symptom chips above the input bar. Click the **"🤒 Fever"** chip.
- **Spoken Lines**:
  > *"Users can quickly select common symptoms or type their own query. Our RAG-enhanced AI analyzes the input against a medical knowledge base and immediately returns plain-language guidance along with an automated triage severity badge — in this case, recommending 'See a Doctor'."*
- **Visual Callout**: Highlight the **"See a Doctor"** (Yellow) badge below the AI message.

---

### 🟡 [0:35 - 0:55] Emergency Triage & Hospital Finder
- **Action**: In the input field, type:  
  `"I have severe chest pain and difficulty breathing"`  
  Press **Enter**.
- **Spoken Lines**:
  > *"For high-risk symptoms like chest pain, Sahayak Health instantly flags an 'Emergency' severity status with a visual pulse indicator. Furthermore, it automatically renders the 'Nearby Help' section listing real hospitals in Surat with direct 1-click calling."*
- **Action**: Click the **Call Now** button on one of the hospital cards to demonstrate `tel:` link triggering.

---

### 🔴 [0:55 - 1:15] Multilingual Support (Hindi & Gujarati)
- **Action**: Click the language dropdown in the top-right header and select **"हिंदी"**.
- **Action**: Type or select a symptom in Hindi (e.g., `"मुझे सिरदर्द है"`). Press **Enter**.
- **Spoken Lines**:
  > *"Language should never be a barrier to care. Sahayak Health seamlessly adapts to Hindi and Gujarati, providing naturally phrased medical advice tailored to the user's selected language."*
- **Action**: Switch language to **"ગુજરાતી"** and observe localized UI placeholder update.

---

### 🟣 [1:15 - 1:30] Voice Input & One-Click Health Summary
- **Action**: Click the **Microphone (Mic)** icon in the input bar to activate Web Speech API voice input (or explain its browser-native speech recognition).
- **Action**: Click the **"Get Health Summary"** button at the top right of the message container.
- **Spoken Lines**:
  > *"Finally, users can speak their symptoms directly via voice input. When ready, clicking 'Get Health Summary' generates a clean, structured summary card detailing symptoms discussed, advice given, and overall severity — perfect for sharing with a healthcare provider."*
- **Visual Callout**: Show the generated **Health Summary** card on screen.

---

## 🎯 Key Takeaways for Presenters
1. **Clear Voice Delivery**: Speak steadily and match your actions to the timing cues above.
2. **Mobile Layout Check**: Shrink browser to 375px width if demonstrating mobile responsiveness.
3. **Emergency Notice**: Always reiterate that Sahayak Health is an informational tool and not a substitute for professional medical care.
