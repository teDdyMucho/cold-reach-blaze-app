import { cn } from "@/lib/utils";
import { EmailComponent } from "@/types/email";

interface EmailComponentRendererProps {
  component: EmailComponent;
}

const EmailComponentRenderer = ({ component }: EmailComponentRendererProps) => {
  const { type, content, styles } = component;

  // Convert styles object to CSS style object
  const getCssStyles = (styleObj: Record<string, any>) => {
    const cssStyles: Record<string, string | number> = {};
    
    // Process special styles like paddingX and paddingY
    if (styleObj.paddingX !== undefined) {
      cssStyles.paddingLeft = `${styleObj.paddingX}px`;
      cssStyles.paddingRight = `${styleObj.paddingX}px`;
    }
    
    if (styleObj.paddingY !== undefined) {
      cssStyles.paddingTop = `${styleObj.paddingY}px`;
      cssStyles.paddingBottom = `${styleObj.paddingY}px`;
    }
    
    // Add all other styles
    Object.entries(styleObj).forEach(([key, value]) => {
      if (key !== 'paddingX' && key !== 'paddingY') {
        cssStyles[key] = value;
      }
    });
    
    return cssStyles;
  };

  const renderComponent = () => {
    switch (type) {
      case 'text':
        return (
          <div style={getCssStyles(styles)}>
            {content}
          </div>
        );
        
      case 'button':
        return (
          <div 
            className="inline-block"
            style={{ textAlign: styles.textAlign || 'center', width: '100%' }}
          >
            <a 
              href={component.url || '#'}
              className="inline-block"
              style={getCssStyles(styles)}
            >
              {content}
            </a>
          </div>
        );
        
      case 'image':
        return (
          <div style={{ textAlign: styles.textAlign || 'center' }}>
            <img 
              src={component.src || "https://placehold.co/600x200"}
              alt={component.alt || ""}
              style={getCssStyles(styles)}
            />
          </div>
        );
        
      case 'container':
        return (
          <div style={getCssStyles(styles)}>
            {content}
          </div>
        );
        
      case 'columns':
        return (
          <div style={getCssStyles(styles)}>
            {component.columns?.map((column, index) => (
              <div key={column.id} style={getCssStyles(column.styles)}>
                {column.components.map(comp => (
                  <EmailComponentRenderer key={comp.id} component={comp} />
                ))}
              </div>
            ))}
          </div>
        );
        
      case 'divider':
        return <hr style={getCssStyles(styles)} />;
        
      case 'spacer':
        return <div style={getCssStyles(styles)}></div>;

      case 'text-image':
        const containerStyles = {
          ...getCssStyles(styles),
          display: 'flex',
          alignItems: styles.alignItems || 'center',
          gap: '20px',
          flexDirection: styles.flexDirection || 'row',
        };

        const imageStyles = {
          ...getCssStyles(component.imageStyles || {}),
          width: component.imageWidth || '50%',
          order: component.imagePosition === 'right' ? 2 : 1
        };
        
        const textStyles = {
          ...getCssStyles(component.textStyles || {}),
          width: '50%',
          order: component.imagePosition === 'right' ? 1 : 2
        };

        return (
          <div style={containerStyles}>
            <div style={textStyles}>
              {content}
            </div>
            <img 
              src={component.src || "https://placehold.co/600x400"}
              alt={component.alt || ""}
              style={imageStyles}
            />
          </div>
        );
        
      default:
        return <div>Unknown component type</div>;
    }
  };

  return renderComponent();
};

export default EmailComponentRenderer;