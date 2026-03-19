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


class ConnectorConfigReadSafe(BaseModel):
    """Response schema — omits config to avoid leaking stored credentials."""
    id: str
    system_id: str
    connector_name: str
    is_enabled: bool

    model_config = {"from_attributes": True}
