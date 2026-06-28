import { PlaceholderPage } from '@/components/ui/PageShell';



export const metadata = { title: 'News' };



export default function BlogPage() {

  return (

    <PlaceholderPage

      title="News"

      description="Suzuki news, reviews and ownership tips."

      breadcrumbs={[

        { label: 'Home', href: '/' },

        { label: 'News' },

      ]}

    />

  );

}

