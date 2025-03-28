import GerminablesHero from '../components/germinables/GerminablesHero';
import GerminablesNav from '../components/germinables/GerminablesNav';
import GerminablesOverview from '../components/germinables/GerminablesOverview';
import GerminablesBenefits from '../components/germinables/GerminablesBenefits';
import GerminablesProducts from '../components/germinables/GerminablesProducts';
import GerminablesProcess from '../components/germinables/GerminablesProcess';
import GerminablesFAQ from '../components/germinables/GerminablesFAQ';
import GerminablesCTA from '../components/germinables/GerminablesCTA';

export const metadata = {
  title: 'Invitaciones Germinables | EcoBodas',
  description: 'Invitaciones de boda ecológicas en papel con semillas, elaboradas artesanalmente',
};

export default function GerminablesPage() {
  return (
    <div className="pt-4">
      <GerminablesHero />
      <GerminablesNav />
      <GerminablesOverview />
      <GerminablesBenefits />
      <GerminablesProducts />
      <GerminablesProcess />
      <GerminablesFAQ />
      <GerminablesCTA />
    </div>
  );
}