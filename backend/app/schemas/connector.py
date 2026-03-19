from pydantic import BaseModel


class ConnectorConfigCreate(BaseModel):
    connector_name: str
    config: dict = {}
    is_enabled: bool = True


class ConnectorConfigRead(BaseModel):
    id: str
    system_id: str
    connector_name: str
    config: dict
    is_enabled: bool

    model_config = {"from_attributes": True}
