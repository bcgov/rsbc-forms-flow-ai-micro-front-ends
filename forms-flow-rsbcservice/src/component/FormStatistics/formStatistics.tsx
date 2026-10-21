import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { fetchFormStatistics } from '../../request/formStatisticsApi';
// @ts-ignore — SCSS is handled by the bundler and has no TypeScript declarations.
import './formStatistics.scss';

interface FormInventoryItem {
  form_type: string;
  form_name: string;
  total_forms: number;
  leased_forms: number;
  total_used_forms: number;
  available_forms: number;
}

const FormStatisticsContent = () => {
  const [formData, setFormData] = useState<FormInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFormStatistics(
      setFormData,
      setError
    ).finally(() => setIsLoading(false));
  }, []);

  const getStatusClass = (availableForms: number) => {
    if (availableForms < 50000) return 'danger';
    if (availableForms <= 60000) return 'warning';
    return 'success';
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container fluid className="mt-4">
      <h1 className="mb-4 h2 fw-bold">Form Numbers Inventory</h1>
      <Row>
        {formData.map((form: FormInventoryItem) => (
          <Col key={form.form_type} lg={6} className="mb-4">
            <Card>
              <Card.Header as="h5">{form.form_name}</Card.Header>
              <Card.Body>
                <div className={`circle-container ${getStatusClass(form.available_forms)}`}>
                  <div className="circle total">
                    <span className="number">{form.total_forms}</span>
                    <span className="label">Total</span>
                  </div>
                  <div className="circle leased">
                    <span className="number">{form.leased_forms}</span>
                    <span className="label">Leased</span>
                  </div>
                  <div className="circle used">
                    <span className="number">{form.total_used_forms}</span>
                    <span className="label">Used</span>
                  </div>
                  <div className="circle available">
                    <span className="number">{form.available_forms}</span>
                    <span className="label">Available</span>
                  </div>
                </div>
                {form.available_forms < 50000 && (
                  <Alert variant="danger" className="mt-3">
                    Critical: Available forms are below 50,000!
                  </Alert>
                )}
                {form.available_forms >= 50000 && form.available_forms <= 60000 && (
                  <Alert variant="warning" className="mt-3">
                    Warning: Available forms are between 50,000 and 60,000!
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};
/**
 * The host app renders with React 17 while this bundle ships React 18, so hooks
 * cannot run inside the host's renderer. Mount the content in its own React 18 root.
 */
export class FormStatistics extends React.Component {
  private containerRef = React.createRef<HTMLDivElement>();
  private root: Root | null = null;

  componentDidMount() {
    this.root = createRoot(this.containerRef.current as HTMLElement);
    this.root.render(<FormStatisticsContent />);
  }

  componentWillUnmount() {
    const root = this.root;
    this.root = null;
    setTimeout(() => root?.unmount(), 0);
  }

  render() {
    return <div ref={this.containerRef} />;
  }
}
