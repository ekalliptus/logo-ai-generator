import { useState } from 'react';
import JSZip from 'jszip';

// Layout components
import { Navigation } from './layout/Navigation';
import { MainLayout } from './layout/MainLayout';
import { LeftPanel } from './layout/LeftPanel';
import { RightPanel } from './layout/RightPanel';

// Input components
import { BrandConceptInput } from './input/BrandConceptInput';
import { StyleSelector } from './input/StyleSelector';
import { ColorCustomizer } from './input/ColorCustomizer';
import { GenerateButton } from './input/GenerateButton';

// Output components
import { LogoOutput } from './output/LogoOutput';
import { MessageBox } from './output/MessageBox';
import { ActionsContainer } from './output/ActionsContainer';
import { Gallery } from './output/Gallery';

// Hooks
import { useAuth } from '../contexts/AuthContext';
import { useLogoGenerator } from '../hooks/useLogoGenerator';
import { useNotification } from '../hooks/useNotification';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

// Utils
import { LOGO_STYLES } from '../utils/constants';
import { generateFinalPrompt } from '../utils/promptBuilder';
import { saveToHistory } from '../utils/storage';

export function MainApp() {
  const { canGenerate, getRemainingGenerations, incrementUsage } = useAuth();

  // State management
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(LOGO_STYLES[0].name);
  const [customColors, setCustomColors] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Custom hooks
  const { generateLogo, isLoading, imageUrls } = useLogoGenerator();
  const { message, showError, showSuccess, showInfo, showWarning, clearMessage } = useNotification();
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // Handlers
  const handleGenerate = async () => {
    clearMessage();

    if (!userPrompt.trim()) {
      showError('Please describe your brand concept to generate a logo.');
      return;
    }

    // Check usage limits
    if (!canGenerate()) {
      const remaining = getRemainingGenerations();
      showError(
        remaining === 0
          ? 'You have reached your daily limit. Upgrade to Pro for more generations!'
          : 'Cannot generate logo at this time.'
      );
      return;
    }

    const result = await generateLogo(userPrompt, selectedStyle, customColors);

    if (result && result.imageUrls.length > 0) {
      // Increment usage count
      await incrementUsage();

      showSuccess(
        `Success! ${result.imageUrls.length} AI-generated logo${
          result.imageUrls.length > 1 ? 's' : ''
        } ready for download.`
      );

      // Save first image to history
      saveToHistory({
        imageUrl: result.imageUrls[0],
        prompt: result.prompt,
        style: result.style,
        customColors: result.customColors,
      });

      // Show remaining count
      const remaining = getRemainingGenerations();
      if (remaining <= 2) {
        showWarning(`You have ${remaining} generation${remaining !== 1 ? 's' : ''} left today.`);
      }
    }
  };

  const handleCopyPrompt = () => {
    const fullPrompt = generateFinalPrompt(userPrompt, selectedStyle, customColors);
    const success = copyToClipboard(fullPrompt);
    if (success) {
      showInfo('Full AI prompt copied to clipboard!');
    } else {
      showError('Failed to copy prompt to clipboard.');
    }
  };

  const handleDownloadAll = async () => {
    if (!imageUrls || imageUrls.length === 0) return;

    try {
      const zip = new JSZip();

      // Add each image to the zip
      for (let i = 0; i < imageUrls.length; i++) {
        const response = await fetch(imageUrls[i]);
        const blob = await response.blob();
        zip.file(`logo_${selectedStyle.toLowerCase()}_${i + 1}.png`, blob);
      }

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logos_${selectedStyle.toLowerCase()}_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      showSuccess('All logos downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      showError('Failed to download logos. Please try again.');
    }
  };

  const handleLoadFromHistory = (item) => {
    setUserPrompt(item.prompt);
    setSelectedStyle(item.style);
    setCustomColors(item.customColors);
    showInfo('Logo loaded from history!');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleGenerate();
    }
  };

  const currentImageUrl =
    imageUrls && imageUrls.length > 0 ? imageUrls[selectedImageIndex] : null;
  const fileName = `logo_${selectedStyle.toLowerCase().replace(/\s/g, '_')}.png`;

  return (
    <div className="bg-gray-100 min-h-screen" onKeyDown={handleKeyPress}>
      <Navigation />

      <MainLayout>
        <LeftPanel>
          <BrandConceptInput value={userPrompt} onChange={setUserPrompt} />

          <StyleSelector selectedStyle={selectedStyle} onStyleChange={setSelectedStyle} />

          <ColorCustomizer customColors={customColors} onColorsChange={setCustomColors} />

          <GenerateButton
            isLoading={isLoading}
            onClick={handleGenerate}
            disabled={!userPrompt.trim() || !canGenerate()}
          />

          <MessageBox message={message} onClose={clearMessage} />

          <Gallery onLoadFromHistory={handleLoadFromHistory} />
        </LeftPanel>

        <RightPanel>
          <LogoOutput
            imageUrls={imageUrls}
            isLoading={isLoading}
            onSelectImage={(url, index) => setSelectedImageIndex(index)}
          />

          <ActionsContainer
            imageUrl={currentImageUrl}
            fileName={fileName}
            onCopyPrompt={handleCopyPrompt}
            isCopied={isCopied}
            hasImages={imageUrls && imageUrls.length > 0}
            onDownloadAll={handleDownloadAll}
            hasMultiple={imageUrls && imageUrls.length > 1}
          />
        </RightPanel>
      </MainLayout>
    </div>
  );
}
