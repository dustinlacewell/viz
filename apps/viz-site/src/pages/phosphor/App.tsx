import { FeaturesSection } from './page/FeaturesSection'
import { Footer } from './page/Footer'
import { Hero } from './page/Hero'
import { InstallSection } from './page/InstallSection'
import { PrimitivesListing } from './page/PrimitivesListing'
import { ArcGaugeSection } from './sections/ArcGaugeSection'
import { ChipToggleSection } from './sections/ChipToggleSection'
import { CodeBlockSection } from './sections/CodeBlockSection'
import { DisplayRecessedSection } from './sections/DisplayRecessedSection'
import { DisplaySection } from './sections/DisplaySection'
import { DropdownSection } from './sections/DropdownSection'
import { HelpTooltipSection } from './sections/HelpTooltipSection'
import { HueStripSection } from './sections/HueStripSection'
import { IconPickerSection } from './sections/IconPickerSection'
import { IndexStripSection } from './sections/IndexStripSection'
import { KeyBankSection } from './sections/KeyBankSection'
import { KnobSection } from './sections/KnobSection'
import { LeverSwitchSection } from './sections/LeverSwitchSection'
import { ModalSection } from './sections/ModalSection'
import { NumberFieldSection } from './sections/NumberFieldSection'
import { PanelSection } from './sections/PanelSection'
import { PushButtonSection } from './sections/PushButtonSection'
import { ScrubChipRowSection } from './sections/ScrubChipRowSection'
import { SegmentedDisplaySection } from './sections/SegmentedDisplaySection'
import { SidePanelSection } from './sections/SidePanelSection'
import { SliderSection } from './sections/SliderSection'
import { TabsSection } from './sections/TabsSection'

/** The phosphor showcase: intro, install, then one row per component. */
export function App() {
  return (
    <div className="site">
      <Hero />
      <InstallSection />
      <FeaturesSection />
      <PrimitivesListing>
        <PanelSection />
        <DisplaySection />
        <DisplayRecessedSection />
        <PushButtonSection />
        <KeyBankSection />
        <ModalSection />
        <LeverSwitchSection />
        <SegmentedDisplaySection />
        <ScrubChipRowSection />
        <ChipToggleSection />
        <HueStripSection />
        <CodeBlockSection />
        <TabsSection />
        <KnobSection />
        <ArcGaugeSection />
        <SliderSection />
        <NumberFieldSection />
        <DropdownSection />
        <IconPickerSection />
        <HelpTooltipSection />
        <IndexStripSection />
        <SidePanelSection />
      </PrimitivesListing>
      <Footer />
    </div>
  )
}
